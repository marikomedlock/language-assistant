#!/usr/bin/python
#encoding=utf-8

import sys, jieba

#if __name__=="__main__":
arg_ctr = 0
for arg in sys.argv:
	if arg_ctr==0:
		arg_ctr += 1
		continue
	seg_list = jieba.cut(arg.decode('utf-8'))
	seg_str = "\n".join(seg_list)
	print seg_str.encode('utf-8'),
	arg_ctr += 1

# write to debug file
#outfile = file('/blueprints_volume/blueprint/reading/mariko.txt','w')
#outfile.write('yyyy1212\n')
#outfile.write(seg_str.encode('utf-8'))
#outfile.write('まりこ\n')
#outfile.close()

