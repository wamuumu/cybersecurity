import pickle
from gib import gib_detect_train
from dga_routines import count_consonants, entropy
import tldextract
import argparse
import json

exit_code = 0

def read_file(filename):
    with open(filename) as f:
        for line in f:
            yield line.strip("\n")


def domain_check(domain):
    
    global exit_code

    # skip tor domains
    if domain.endswith(".onion") and exit_code == 0:
        exit_code=1
    
    # we only interested in main domain name without subdomain and tld
    domain_without_sub = tldextract.extract(domain).domain
    
    # skip localized domains
    if domain_without_sub.startswith("xn-") and exit_code == 0:
        exit_code=2

    # skip short domains
    if len(domain_without_sub) < 6 and exit_code == 0:
        exit_code=3
        
    domain_entropy = entropy(domain_without_sub)
    domain_consonants = count_consonants(domain_without_sub)
    domain_length = len(domain_without_sub)
    return domain_without_sub, domain_entropy, domain_consonants, domain_length


def main():
    global exit_code
    parser = argparse.ArgumentParser(description="DGA domain detection")
    parser.add_argument("-d", "--domain", help="Domain to check")
    parser.add_argument("-f", "--file", help="File with domains. One per line")
    parser.add_argument("-p", "--path", help="Folder path")
    args = parser.parse_args()
    model_data = pickle.load(open(args.path + '/gib/gib_model.pki', 'rb'))
    model_mat = model_data['mat']
    threshold = model_data['thresh']

    if args.domain:
        if domain_check(args.domain):
            results = {"domain": "", "is_dga": "", "consonants": "", "entropy": "", "domain_length": "", "exit_code": 0}
            domain_without_sub, domain_entropy, domain_consonants, domain_length = domain_check(args.domain)
            
            results["domain"] = args.domain
            results["entropy"] = domain_entropy
            results["consonants"] = domain_consonants
            results["domain_length"] = domain_length
            
            if not gib_detect_train.avg_transition_prob(domain_without_sub, model_mat) > threshold:
                results["is_dga"] = True
            else:
                results['is_dga'] = False

        results["exit_code"] = exit_code
        print(json.dumps(results, indent=4))
        print("---")

    elif args.file:
        domains = read_file(args.file)
        results = {"domain": "", "is_dga": "", "consonants": "", "entropy": "", "domain_length": "", "exit_code": 0}

        for domain in domains:
            results["domain"] = domain
            exit_code = 0
            if domain_check(domain):
                #print(domain, exit_code)
                domain_without_sub, domain_entropy, domain_consonants, domain_length = domain_check(domain)
                results["entropy"] = domain_entropy
                results["consonants"] = domain_consonants
                results["domain_length"] = domain_length
                if not gib_detect_train.avg_transition_prob(domain_without_sub, model_mat) > threshold:
                    results["is_dga"] = True
                else:
                    results["is_dga"] = False

            results["exit_code"] = exit_code
            print(json.dumps(results, indent=4))
            print("---")

    else:
        print('error')

    exit(exit_code)

if __name__ == '__main__':
    main()
