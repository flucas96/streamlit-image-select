import setuptools


with open("README.md", "r", encoding="utf-8") as f:
    long_desc = f.read()

setuptools.setup(
name = "streamlit-image-select-rows",
version = "0.7.4",
description = "🖼️ An image select component for Streamlit",
authors = ["Johannes Rieke <johannes.rieke@gmail.com>", "Fabian Lucas <fl@msr.de>"] ,
license = "MIT",
readme = "README.md",
setup_requires=['wheel'],
long_description=long_desc,
long_description_content_type='text/markdown',
packages=setuptools.find_packages(),
include_package_data=True,
classifiers=[],
python_requires=">=3.6",
install_requires=[
        # By definition, a Custom Component depends on Streamlit.
        # If your component has other Python dependencies, list
        # them here.
        "streamlit >= 0.63",
],
)