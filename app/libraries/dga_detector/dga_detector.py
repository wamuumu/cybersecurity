from pandas import read_csv, concat

from sklearn.model_selection import train_test_split

from keras_preprocessing.sequence import pad_sequences
from keras.models import Sequential, load_model
from keras.layers.core import Dense, Dropout, Activation
from tensorflow.keras.layers import Embedding
from keras.layers import LSTM

import numpy as np
import tldextract as tlde
import tensorflow as tf
import tensorflowjs as tfjs
import re as regex
import math
import os
import argparse
import json

# disable annoying messages from tensorflow
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'
tf.compat.v1.logging.set_verbosity(tf.compat.v1.logging.ERROR)

global validChars, maxFeatures, maxLength, domains_train, domains_test, labels_train, labels_test

def read_file(filename):
    with open(filename) as f:
        for line in f:
            yield line.strip("\n")

def entropy(string):
    # Shannon entropy
    # get probability of chars in string
    prob = [ float(string.count(c)) / len(string) for c in dict.fromkeys(list(string)) ]
    entropy = - sum([ p * math.log(p) / math.log(2.0) for p in prob ])
    return entropy

def create_dataset():
	print("Creating dataset...")
	# read the csv file containing domains
	cisco_domains = read_csv('cisco_domains.csv', names=['raw_domain'])
	dga_domains = read_csv('dga_domains.csv', names=['raw_domain'])

	# extract the top level domain and remove unwanted chars
	cisco_domains['domain'] = [regex.sub('[^A-Za-z0-9]+', '', tlde.extract(d).domain) for d in cisco_domains['raw_domain']]
	dga_domains['domain'] = [regex.sub('[^A-Za-z0-9]+', '', tlde.extract(d).domain) for d in dga_domains['raw_domain']]

	# assign label to each domain
	#cisco_domains['label'] = 0
	#dga_domains['label'] = 1

	cisco_domains['label'] = 'legit'
	dga_domains['label'] = 'dga'

	# remove unwanted columns and duplicates
	cisco_domains = cisco_domains.drop(columns=['raw_domain'])
	cisco_domains = cisco_domains.drop_duplicates(subset=['domain'])
	dga_domains = dga_domains.drop(columns=['raw_domain'])
	dga_domains = dga_domains.drop_duplicates(subset=['domain'])

	print(cisco_domains)
	print(dga_domains)

	# combine the two datesets and shuffle them
	domains = concat([cisco_domains, dga_domains], ignore_index=True).sample(frac=1).reset_index(drop=True)
	domains = domains.drop_duplicates(subset=['domain'])

	#add more common features
	domains['length'] = [len(x) for x in domains['domain']]
	domains = domains[domains['length'] > 6]
	domains['entropy'] = [entropy(x) for x in domains['domain']]

	X = domains.as_matrix(['length', 'entropy'])
	y = np.array(domains['label'].tolist())

	cisco_vc = sklearn.feature_extraction.text.CountVectorizer(analyzer='char', ngram_range=(3,5), min_df=1e-4, max_df=1.0)
	counts_matrix = cisco_vc.fit_transform(cisco_domains['domain'])
	cisco_counts = np.log10(counts_matrix.sum(axis=0).getA1())
	ngrams_list = cisco_vc.get_feature_names()

	words = read_csv('words.csv', names=['word'])

	words = words[words['word'].map(lambda x: str(x).isalpha())]
	words = words.applymap(lambda x: str(x).strip().lower())
	words = words.dropna()
	words = words.drop_duplicates()

	dict_vc = sklearn.feature_extraction.text.CountVectorizer(analyzer='char', ngram_range=(3,5), min_df=1e-5, max_df=1.0)
	counts_matrix = dict_vc.fit_transform(words['word'])
	dict_counts = np.log10(counts_matrix.sum(axis=0).getA1())
	ngrams_list = dict_vc.get_feature_names()

	domains['cisco_grams']= cisco_counts * cisco_vc.transform(domains['domain']).T 
	domains['word_grams']= dict_counts * dict_vc.transform(domains['domain']).T 

	domains.to_csv('./domains1.csv', index=False)
	print("Dataset created!")

	print(domains)

def setup(path):
	global validChars, maxFeatures, maxLength, domains_train, domains_test, labels_train, labels_test

	test_cases = read_csv(path + '/domains.csv', skipinitialspace=True, skiprows=1, names=['domain','label'])
	domains, labels = test_cases['domain'], test_cases['label']

	doms = {}
	charSet = set()
	for i, value in domains.items():
		val = str(value).lower()
		doms[value] = int(labels[i]) 
		for j in range(len(val)):
			charSet.add(val[j])

	validChars = { x: idx + 1 for idx, x in enumerate(charSet)}
	maxFeatures = len(validChars) + 1 #different chars
	maxLength = np.max([len(str(x)) for x in domains]) #longest domain

	#obj = { 'validChars': validChars, 'maxFeatures': int(maxFeatures), 'maxLength': int(maxLength)}

	#json_string = json.dumps(obj)
	#with open('../../static/tfjs/setup.json', 'w+') as outfile:
	#	outfile.write(json_string)

	#json_string = json.dumps(doms)
	#with open('../../static/tfjs/domains.json', 'w+') as outfile:
	#	outfile.write(json_string)

	# encode each char of each domain into its validChar representation
	domains = [[validChars[y] for y in str(x)] for x in domains]
	domains = pad_sequences(domains, maxlen=maxLength)

	domains_train, domains_test, labels_train, labels_test = train_test_split(domains, labels, test_size=0.2)

def train():

	setup('.')

	global maxFeatures, maxLength, domains_train, labels_train

	print("Start training...")

	# build LSTM Model
	model = Sequential()
	model.add(Embedding(maxFeatures, 128, input_length=maxLength)) #layer to turn input sequence into fixed-length vector
	model.add(LSTM(128)) # layer with 128 neurons
	model.add(Dropout(0.5)) # layer to prevent overfitting
	model.add(Dense(1))
	model.add(Activation('sigmoid')) # final layer that produce the result

	# being that the model is binary ('legit' or 'dga'), use binary loss function to improve accurancy and reduce training time
	model.compile(loss='binary_crossentropy', optimizer='rmsprop', metrics=['accuracy'])

	# train 
	for i in range(5):
		print("Train [" + str(i+1) + "]")
		model.fit(domains_train, labels_train, epochs=1)
		model.save('cisco_dm_' + str(i+1), overwrite=True)
		tfjs.converters.save_keras_model(model, '../../static/tfjs/cisco_dm_' + str(i+1))

	print("Training complete!")

def detect(domainName, path):

	setup(path)

	modelName = path + '/cisco_dm'

	global validChars, maxLength

	detection_model = load_model(modelName)

	domain = [[validChars[ch] for ch in tlde.extract(domainName).domain]]
	domain = pad_sequences(domain, maxlen=maxLength)

	prediction = True if detection_model.predict(domain, verbose = 0)[0][0] > 0.5 else False

	print("[" + modelName + "] " + domainName + " is " + str(prediction) + "(" + str(detection_model.predict(domain)[0][0]) + ")")

	return prediction

if __name__ == "__main__":

	parser = argparse.ArgumentParser(description="DGA domain detection")
	parser.add_argument("-d", "--domain", help="Domain to check")
	parser.add_argument("-f", "--file", help="File with domains. One per line")
	parser.add_argument("-p", "--path", default=".", help="Folder path")

	parser.add_argument('--func', nargs='?', default="")
	
	subparsers = parser.add_subparsers()
	
	parser_dataset = subparsers.add_parser('dataset', help='Create a new dataset')
	parser_dataset.set_defaults(func=create_dataset)

	parser_dataset = subparsers.add_parser('train', help='Train the model')
	parser_dataset.set_defaults(func=train)
	

	args = parser.parse_args()


	if args.func != "":
		args.func()

	else:

		results = {"domain": "", "is_dga": ""}

		if args.domain:
			prediction = detect(args.domain, args.path)

			results['domain'] = args.domain
			results['is_dga'] = prediction

			print(json.dumps(results, indent=4))
			print("---")

		elif args.file:
			domains = read_file(args.file)

			for domain in domains:
				prediction = detect(domain, args.path)

				results['domain'] = domain
				results['is_dga'] = prediction

				print(json.dumps(results, indent=4))
				print("---")
		else:
			print("Error")

	exit(0)



