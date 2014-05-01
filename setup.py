#!/usr/bin/env python

from distutils.core import setup
from setuptools import find_packages

setup(
        name='phi_server',
        version='1',
        description='Server code for phiMessage',
        author='Matt',
        author_email='mgaut72@gmail.com',
        url='https://github.com/mgaut72/phiMessage',
        packages=find_packages(),
        install_requires=['Flask>=0.10.1']
        )
