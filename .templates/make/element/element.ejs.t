---
to: packages/<%= packageName %>/<%= elementName %>/element.js
---
import { defineElement } from "@currentjs/element";
import <%= className %> from './src/<%= elementName %>';

defineElement('<%= elementName %>', <%= className %>);

