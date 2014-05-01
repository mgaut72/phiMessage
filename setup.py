#!/usr/bin/env python

from distutils.core import setup
from setuptools import find_packages

setup(
        name='phi_message',
        version='1',
        description='phiMessage source',
        author='Matt, Chris',
        author_email='mgaut72@gmail.com, cjlarose@gmail.com',
        url='https://github.com/mgaut72/phiMessage',
        packages=find_packages(),
        install_requires=['Flask>=0.10.1']
        )

