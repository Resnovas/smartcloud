"use strict";(self.webpackChunksmartcloud=self.webpackChunksmartcloud||[]).push([[1195],{3905:function(t,e,n){n.d(e,{Zo:function(){return c},kt:function(){return p}});var r=n(7294);function i(t,e,n){return e in t?Object.defineProperty(t,e,{value:n,enumerable:!0,configurable:!0,writable:!0}):t[e]=n,t}function o(t,e){var n=Object.keys(t);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(t);e&&(r=r.filter((function(e){return Object.getOwnPropertyDescriptor(t,e).enumerable}))),n.push.apply(n,r)}return n}function a(t){for(var e=1;e<arguments.length;e++){var n=null!=arguments[e]?arguments[e]:{};e%2?o(Object(n),!0).forEach((function(e){i(t,e,n[e])})):Object.getOwnPropertyDescriptors?Object.defineProperties(t,Object.getOwnPropertyDescriptors(n)):o(Object(n)).forEach((function(e){Object.defineProperty(t,e,Object.getOwnPropertyDescriptor(n,e))}))}return t}function u(t,e){if(null==t)return{};var n,r,i=function(t,e){if(null==t)return{};var n,r,i={},o=Object.keys(t);for(r=0;r<o.length;r++)n=o[r],e.indexOf(n)>=0||(i[n]=t[n]);return i}(t,e);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(t);for(r=0;r<o.length;r++)n=o[r],e.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(t,n)&&(i[n]=t[n])}return i}var s=r.createContext({}),l=function(t){var e=r.useContext(s),n=e;return t&&(n="function"==typeof t?t(e):a(a({},e),t)),n},c=function(t){var e=l(t.components);return r.createElement(s.Provider,{value:e},t.children)},d={inlineCode:"code",wrapper:function(t){var e=t.children;return r.createElement(r.Fragment,{},e)}},g=r.forwardRef((function(t,e){var n=t.components,i=t.mdxType,o=t.originalType,s=t.parentName,c=u(t,["components","mdxType","originalType","parentName"]),g=l(n),p=i,b=g["".concat(s,".").concat(p)]||g[p]||d[p]||o;return n?r.createElement(b,a(a({ref:e},c),{},{components:n})):r.createElement(b,a({ref:e},c))}));function p(t,e){var n=arguments,i=e&&e.mdxType;if("string"==typeof t||i){var o=n.length,a=new Array(o);a[0]=g;var u={};for(var s in e)hasOwnProperty.call(e,s)&&(u[s]=e[s]);u.originalType=t,u.mdxType="string"==typeof t?t:i,a[1]=u;for(var l=2;l<o;l++)a[l]=n[l];return r.createElement.apply(null,a)}return r.createElement.apply(null,n)}g.displayName="MDXCreateElement"},5682:function(t,e,n){n.r(e),n.d(e,{assets:function(){return c},contentTitle:function(){return s},default:function(){return p},frontMatter:function(){return u},metadata:function(){return l},toc:function(){return d}});var r=n(7462),i=n(3366),o=(n(7294),n(3905)),a=["components"],u={title:"Contribution Types",sidebar_label:"Contribution Types",sidebar_position:2},s=void 0,l={unversionedId:"getting-started/contributing/Start Contributing/types",id:"getting-started/contributing/Start Contributing/types",title:"Contribution Types",description:"Minor Contributions",source:"@site/docs/getting-started/contributing/Start Contributing/types.md",sourceDirName:"getting-started/contributing/Start Contributing",slug:"/getting-started/contributing/Start Contributing/types",permalink:"/smartcloud/docs/getting-started/contributing/Start Contributing/types",draft:!1,editUrl:"https://github.com/resnovas/smartcloud/edit/develop/docs/docs/getting-started/contributing/Start Contributing/types.md",tags:[],version:"current",sidebarPosition:2,frontMatter:{title:"Contribution Types",sidebar_label:"Contribution Types",sidebar_position:2},sidebar:"getting",previous:{title:"Understanding Labels Names",permalink:"/smartcloud/docs/getting-started/contributing/Start Contributing/labels"},next:{title:"External Contributions",permalink:"/smartcloud/docs/getting-started/contributing/Start Contributing/external"}},c={},d=[{value:"Minor Contributions",id:"minor-contributions",level:2},{value:"Standard Contributions",id:"standard-contributions",level:2},{value:"Major Contributions",id:"major-contributions",level:2}],g={toc:d};function p(t){var e=t.components,n=(0,i.Z)(t,a);return(0,o.kt)("wrapper",(0,r.Z)({},g,n,{components:e,mdxType:"MDXLayout"}),(0,o.kt)("h2",{id:"minor-contributions"},"Minor Contributions"),(0,o.kt)("p",null,"Small contributions such as fixing spelling errors, where the content is small enough to not be considered intellectual property, can be submitted by a contributor as a minor patch, without a CLA."),(0,o.kt)("p",null,"As a rule of thumb, changes are obvious fixes if they do not introduce any new functionality or creative thinking. As long as the change does not affect functionality, some likely examples include the following:"),(0,o.kt)("ul",null,(0,o.kt)("li",{parentName:"ul"},"Spelling / grammar fixes"),(0,o.kt)("li",{parentName:"ul"},"Typo correction, white space and formatting changes"),(0,o.kt)("li",{parentName:"ul"},"Comment clean up"),(0,o.kt)("li",{parentName:"ul"},"Bug fixes that change default return values or error codes stored in constants"),(0,o.kt)("li",{parentName:"ul"},"Adding logging messages or debugging output"),(0,o.kt)("li",{parentName:"ul"},"Changes to \ufffdmetadata\ufffd files like Gemfile, .gitignore, build scripts, etc."),(0,o.kt)("li",{parentName:"ul"},"Moving source files from one directory or package to another")),(0,o.kt)("h2",{id:"standard-contributions"},"Standard Contributions"),(0,o.kt)("p",null,"Standard contributions are contributions which are too large to be considered a minor contribution however, only address one feature or function. This can include, but is not limited to, tutorials, wiki pages, new features (e.g. small integrations) and feature enhancements. Our automation systems will automatically do all the hard work of labeling, assigning and reviewing your contribution."),(0,o.kt)("p",null,"You our required to sign the CLA and agree to it's terms. This will be automatically handled by our automation when you create a pull request, and once signed you will be able to submit without resigning."),(0,o.kt)("h2",{id:"major-contributions"},"Major Contributions"),(0,o.kt)("p",null,"Major contributions are contributions which add, modify or remove multiple features or modules. We can not emphasise enough how much the community helps us every time they submit one of these."),(0,o.kt)("p",null,"You our required to sign the CLA and agree to it's terms. This will be automatically handled by our automation when you create a pull request, and once signed you will be able to submit without resigning."))}p.isMDXComponent=!0}}]);