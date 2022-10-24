"use strict";(self.webpackChunksmartcloud=self.webpackChunksmartcloud||[]).push([[9552],{5318:function(e,t,r){r.d(t,{Zo:function(){return l},kt:function(){return d}});var n=r(7378);function a(e,t,r){return t in e?Object.defineProperty(e,t,{value:r,enumerable:!0,configurable:!0,writable:!0}):e[t]=r,e}function o(e,t){var r=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);t&&(n=n.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),r.push.apply(r,n)}return r}function i(e){for(var t=1;t<arguments.length;t++){var r=null!=arguments[t]?arguments[t]:{};t%2?o(Object(r),!0).forEach((function(t){a(e,t,r[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(r)):o(Object(r)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(r,t))}))}return e}function s(e,t){if(null==e)return{};var r,n,a=function(e,t){if(null==e)return{};var r,n,a={},o=Object.keys(e);for(n=0;n<o.length;n++)r=o[n],t.indexOf(r)>=0||(a[r]=e[r]);return a}(e,t);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);for(n=0;n<o.length;n++)r=o[n],t.indexOf(r)>=0||Object.prototype.propertyIsEnumerable.call(e,r)&&(a[r]=e[r])}return a}var u=n.createContext({}),c=function(e){var t=n.useContext(u),r=t;return e&&(r="function"==typeof e?e(t):i(i({},t),e)),r},l=function(e){var t=c(e.components);return n.createElement(u.Provider,{value:t},e.children)},p={inlineCode:"code",wrapper:function(e){var t=e.children;return n.createElement(n.Fragment,{},t)}},g=n.forwardRef((function(e,t){var r=e.components,a=e.mdxType,o=e.originalType,u=e.parentName,l=s(e,["components","mdxType","originalType","parentName"]),g=c(r),d=a,f=g["".concat(u,".").concat(d)]||g[d]||p[d]||o;return r?n.createElement(f,i(i({ref:t},l),{},{components:r})):n.createElement(f,i({ref:t},l))}));function d(e,t){var r=arguments,a=t&&t.mdxType;if("string"==typeof e||a){var o=r.length,i=new Array(o);i[0]=g;var s={};for(var u in t)hasOwnProperty.call(t,u)&&(s[u]=t[u]);s.originalType=e,s.mdxType="string"==typeof e?e:a,i[1]=s;for(var c=2;c<o;c++)i[c]=r[c];return n.createElement.apply(null,i)}return n.createElement.apply(null,r)}g.displayName="MDXCreateElement"},409:function(e,t,r){r.r(t),r.d(t,{assets:function(){return l},contentTitle:function(){return u},default:function(){return d},frontMatter:function(){return s},metadata:function(){return c},toc:function(){return p}});var n=r(5773),a=r(808),o=(r(7378),r(5318)),i=["components"],s={id:"regex",title:"Using Regex patterns",sidebar_label:"Using Regex"},u=void 0,c={unversionedId:"getting-started/features/regex",id:"getting-started/features/regex",title:"Using Regex patterns",description:"Many conditions use regular expressions (usually with a pattern parameter).",source:"@site/docs/getting-started/features/regex.md",sourceDirName:"getting-started/features",slug:"/getting-started/features/regex",permalink:"/smartcloud/docs/getting-started/features/regex",draft:!1,editUrl:"https://github.com/resnovas/smartcloud/edit/develop/docs/docs/getting-started/features/regex.md",tags:[],version:"current",frontMatter:{id:"regex",title:"Using Regex patterns",sidebar_label:"Using Regex"},sidebar:"getting",previous:{title:"Basic Setup",permalink:"/smartcloud/docs/getting-started/setup"},next:{title:"Running Locally",permalink:"/smartcloud/docs/getting-started/contributing/runningLocally"}},l={},p=[],g={toc:p};function d(e){var t=e.components,r=(0,a.Z)(e,i);return(0,o.kt)("wrapper",(0,n.Z)({},g,r,{components:t,mdxType:"MDXLayout"}),(0,o.kt)("p",null,"Many conditions use regular expressions (usually with a ",(0,o.kt)("inlineCode",{parentName:"p"},"pattern")," parameter).\nSince these regular expressions are passed in through JSON strings, there are\nsome things to pay attention to."),(0,o.kt)("p",null,"Special characters must be double escaped: ",(0,o.kt)("inlineCode",{parentName:"p"},'pattern: "\\\\W+$"')," is equivalent to the Regex: ",(0,o.kt)("inlineCode",{parentName:"p"},"/\\W+$/"),"."),(0,o.kt)("p",null,"If you want to use flags, use the following format: ",(0,o.kt)("inlineCode",{parentName:"p"},'pattern: "/^wip:/i"')," is equivalent to the Regex: ",(0,o.kt)("inlineCode",{parentName:"p"},"/^wip:/i"),"."))}d.isMDXComponent=!0}}]);