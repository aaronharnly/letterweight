from setuptools import setup, find_packages
import sys, os

version = '0.1'

setup(name='letterweight',
      version=version,
      description="How much would each letter weight in a letterpress font? A playful analysis and visualization",
      long_description="""\
""",
      classifiers=[], # Get strings from http://pypi.python.org/pypi?%3Aaction=list_classifiers
      keywords='',
      author='Aaron Harnly',
      author_email='letterweight@bulk.harnly.net',
      url='https://github.com/aaronharnly/letterweight',
      license='MIT',
      packages=find_packages(exclude=['ez_setup', 'examples', 'tests']),
      include_package_data=True,
      zip_safe=False,
      install_requires=[
          # -*- Extra requirements: -*-
      ],
      entry_points="""
      # -*- Entry points: -*-
      """,
      )
