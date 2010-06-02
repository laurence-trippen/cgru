#!/usr/bin/env python

import re
import subprocess

skip = [
r'.*[/\\]{1,1}override.*',
r'.*[/\\]{1,1}tmp',
r'.*[/\\]{1,1}pathmap_.*',
r'.*afanasy.tags.*[/\\]{1,1}bin',
r'.*afanasy.branches.*[/\\]{1,1}bin',
r'.*afanasy.trunk[/\\]{1,1}bin',
r'.*afanasy.trunk.*config.xml.*',
r'.*afanasy.trunk.*farm.xml.*',
r'.*plugins.maya.mll.*',
r'.*utilities.regexp.bin',
r'.*utilities.site.temp',
r'.*utilities.release.output',
r'.*utilities.release.__all__',
r'.*utilities.release.__releases__',
r'.*utilities.release.cgru.*.tar.gz',
r'.*[/\\]{1,1}icons.icons',
r'.*[/\\]{1,1}Makefile',
r'.*[/\\]{1,1}moc_.*',
r'.*project.qmake.project.pro.user',
r'.*project.cmake.*CMakeFiles',
r'.*project.cmake.*CMakeCache.*',
r'.*project.cmake.*\.cmake',
r'.*project.cmake.*\.vcproj',
r'.*project.cmake.*\.sln',
r'.*project.cmake.*\.suo',
r'.*project.cmake.*[/\\]__',
r'.*project.cmake.*\\Release',
r'.*project.cmake.*\\.*\.dir',
r'.*project.cmake.*\\.*\.ncb',
r'.*afanasy/webvisor',
r'.*afanasy/plugins',
r'.*afanasy/doc',
r'.*afanasy/icons',
]

exprs = []
skip_len = len(skip)
print 'Skipping:'
for line in skip:
   exprs.append( re.compile(line))
   print line

output = subprocess.Popen(["svn", "st"], stdout=subprocess.PIPE).stdout

print '\nModifications:\n'
skipped = 0
for line in output:
   skipping = False
   for expr in exprs:
      if expr.match(line) != None:
         skipping = True
         skipped += 1
         break
   if skipping == False: print line,
   
output.close()

print '\nSkipped %d files.' % skipped
