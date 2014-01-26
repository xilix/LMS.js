.PHONY: all 
.DEFAULT: all

all: docs
docs: set
	mocha --reporter doc tests/*js > docs/index.htm
set: clean
	mkdir -p docs
clean:
	rm -rf docs/index.htm
nyanTest:
	mocha --reporter nyan tests/*js
specTest:
	mocha --reporter spec tests/*js
test: nyanTest
spec: specTest

