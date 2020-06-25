---
to: packages/<%= packageName %>/<%= elementName %>/element.js
---
import { defineElement } from "@webtides/element-js";
import <%= className %> from './src/<%= elementName %>';

defineElement('<%= elementName %>', <%= className %>);

