
BABEL = ./node_modules/.bin/babel


node: lib
	@mkdir -p ./node
	@for path in lib/*.js; do \
		file=`basename $$path`; \
		$(BABEL) "lib/$$file" > "node/$$file"; \
	done
	@mkdir -p ./node/caps
	@cp ./lib/caps/*.json ./node/caps/

clean:
	@rm -rf ./node/
