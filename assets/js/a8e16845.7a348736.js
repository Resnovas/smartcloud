"use strict";(self.webpackChunksmartcloud=self.webpackChunksmartcloud||[]).push([[7110],{3905:function(e,t,n){n.d(t,{Zo:function(){return d},kt:function(){return f}});var i=n(7294);function r(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function l(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);t&&(i=i.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,i)}return n}function o(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?l(Object(n),!0).forEach((function(t){r(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):l(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function a(e,t){if(null==e)return{};var n,i,r=function(e,t){if(null==e)return{};var n,i,r={},l=Object.keys(e);for(i=0;i<l.length;i++)n=l[i],t.indexOf(n)>=0||(r[n]=e[n]);return r}(e,t);if(Object.getOwnPropertySymbols){var l=Object.getOwnPropertySymbols(e);for(i=0;i<l.length;i++)n=l[i],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(r[n]=e[n])}return r}var s=i.createContext({}),p=function(e){var t=i.useContext(s),n=t;return e&&(n="function"==typeof e?e(t):o(o({},t),e)),n},d=function(e){var t=p(e.components);return i.createElement(s.Provider,{value:t},e.children)},u={inlineCode:"code",wrapper:function(e){var t=e.children;return i.createElement(i.Fragment,{},t)}},c=i.forwardRef((function(e,t){var n=e.components,r=e.mdxType,l=e.originalType,s=e.parentName,d=a(e,["components","mdxType","originalType","parentName"]),c=p(n),f=r,m=c["".concat(s,".").concat(f)]||c[f]||u[f]||l;return n?i.createElement(m,o(o({ref:t},d),{},{components:n})):i.createElement(m,o({ref:t},d))}));function f(e,t){var n=arguments,r=t&&t.mdxType;if("string"==typeof e||r){var l=n.length,o=new Array(l);o[0]=c;var a={};for(var s in t)hasOwnProperty.call(t,s)&&(a[s]=t[s]);a.originalType=e,a.mdxType="string"==typeof e?e:r,o[1]=a;for(var p=2;p<l;p++)o[p]=n[p];return i.createElement.apply(null,o)}return i.createElement.apply(null,n)}c.displayName="MDXCreateElement"},1572:function(e,t,n){n.r(t),n.d(t,{assets:function(){return d},contentTitle:function(){return s},default:function(){return f},frontMatter:function(){return a},metadata:function(){return p},toc:function(){return u}});var i=n(7462),r=n(3366),l=(n(7294),n(3905)),o=["components"],a={id:"Options",title:"Interface: Options",sidebar_label:"Options",sidebar_position:0,custom_edit_url:null},s=void 0,p={unversionedId:"smartcloud/interfaces/Options",id:"smartcloud/interfaces/Options",title:"Interface: Options",description:"The application options used within Github Actions workflows",source:"@site/docs/smartcloud/interfaces/Options.md",sourceDirName:"smartcloud/interfaces",slug:"/smartcloud/interfaces/Options",permalink:"/smartcloud/docs/smartcloud/interfaces/Options",draft:!1,editUrl:null,tags:[],version:"current",sidebarPosition:0,frontMatter:{id:"Options",title:"Interface: Options",sidebar_label:"Options",sidebar_position:0,custom_edit_url:null},sidebar:"release",previous:{title:"Labels",permalink:"/smartcloud/docs/smartcloud/interfaces/Labels"},next:{title:"PRConditionConfig",permalink:"/smartcloud/docs/smartcloud/interfaces/PRConditionConfig"}},d={},u=[{value:"Properties",id:"properties",level:2},{value:"configJSON",id:"configjson",level:3},{value:"Defined in",id:"defined-in",level:4},{value:"configPath",id:"configpath",level:3},{value:"Defined in",id:"defined-in-1",level:4},{value:"configRef",id:"configref",level:3},{value:"Defined in",id:"defined-in-2",level:4},{value:"dryRun",id:"dryrun",level:3},{value:"Defined in",id:"defined-in-3",level:4},{value:"fillEmpty",id:"fillempty",level:3},{value:"Defined in",id:"defined-in-4",level:4},{value:"git",id:"git",level:3},{value:"Defined in",id:"defined-in-5",level:4},{value:"ref",id:"ref",level:3},{value:"Defined in",id:"defined-in-6",level:4},{value:"repo",id:"repo",level:3},{value:"Defined in",id:"defined-in-7",level:4},{value:"showLogs",id:"showlogs",level:3},{value:"Defined in",id:"defined-in-8",level:4},{value:"skipDelete",id:"skipdelete",level:3},{value:"Defined in",id:"defined-in-9",level:4}],c={toc:u};function f(e){var t=e.components,n=(0,r.Z)(e,o);return(0,l.kt)("wrapper",(0,i.Z)({},c,n,{components:t,mdxType:"MDXLayout"}),(0,l.kt)("p",null,"The application options used within Github Actions workflows"),(0,l.kt)("h2",{id:"properties"},"Properties"),(0,l.kt)("h3",{id:"configjson"},"configJSON"),(0,l.kt)("p",null,"\u2022 ",(0,l.kt)("inlineCode",{parentName:"p"},"Optional")," ",(0,l.kt)("strong",{parentName:"p"},"configJSON"),": ",(0,l.kt)("a",{parentName:"p",href:"/smartcloud/docs/smartcloud/interfaces/Runners"},(0,l.kt)("inlineCode",{parentName:"a"},"Runners"))),(0,l.kt)("p",null,"The json configuration object"),(0,l.kt)("h4",{id:"defined-in"},"Defined in"),(0,l.kt)("p",null,(0,l.kt)("a",{parentName:"p",href:"https://github.com/Resnovas/smartcloud/blob/b9e22a9/src/index.ts#L125"},"src/index.ts:125")),(0,l.kt)("hr",null),(0,l.kt)("h3",{id:"configpath"},"configPath"),(0,l.kt)("p",null,"\u2022 ",(0,l.kt)("inlineCode",{parentName:"p"},"Optional")," ",(0,l.kt)("strong",{parentName:"p"},"configPath"),": ",(0,l.kt)("inlineCode",{parentName:"p"},"string")),(0,l.kt)("p",null,"The path to find the config"),(0,l.kt)("h4",{id:"defined-in-1"},"Defined in"),(0,l.kt)("p",null,(0,l.kt)("a",{parentName:"p",href:"https://github.com/Resnovas/smartcloud/blob/b9e22a9/src/index.ts#L121"},"src/index.ts:121")),(0,l.kt)("hr",null),(0,l.kt)("h3",{id:"configref"},"configRef"),(0,l.kt)("p",null,"\u2022 ",(0,l.kt)("inlineCode",{parentName:"p"},"Optional")," ",(0,l.kt)("strong",{parentName:"p"},"configRef"),": ",(0,l.kt)("inlineCode",{parentName:"p"},"string")),(0,l.kt)("p",null,"The ref to use when retrieving config"),(0,l.kt)("h4",{id:"defined-in-2"},"Defined in"),(0,l.kt)("p",null,(0,l.kt)("a",{parentName:"p",href:"https://github.com/Resnovas/smartcloud/blob/b9e22a9/src/index.ts#L129"},"src/index.ts:129")),(0,l.kt)("hr",null),(0,l.kt)("h3",{id:"dryrun"},"dryRun"),(0,l.kt)("p",null,"\u2022 ",(0,l.kt)("strong",{parentName:"p"},"dryRun"),": ",(0,l.kt)("inlineCode",{parentName:"p"},"boolean")),(0,l.kt)("p",null,"should dry run?"),(0,l.kt)("h4",{id:"defined-in-3"},"Defined in"),(0,l.kt)("p",null,(0,l.kt)("a",{parentName:"p",href:"https://github.com/Resnovas/smartcloud/blob/b9e22a9/src/index.ts#L137"},"src/index.ts:137")),(0,l.kt)("hr",null),(0,l.kt)("h3",{id:"fillempty"},"fillEmpty"),(0,l.kt)("p",null,"\u2022 ",(0,l.kt)("strong",{parentName:"p"},"fillEmpty"),": ",(0,l.kt)("inlineCode",{parentName:"p"},"boolean")),(0,l.kt)("p",null,"Should fill empty values?"),(0,l.kt)("h4",{id:"defined-in-4"},"Defined in"),(0,l.kt)("p",null,(0,l.kt)("a",{parentName:"p",href:"https://github.com/Resnovas/smartcloud/blob/b9e22a9/src/index.ts#L141"},"src/index.ts:141")),(0,l.kt)("hr",null),(0,l.kt)("h3",{id:"git"},"git"),(0,l.kt)("p",null,"\u2022 ",(0,l.kt)("inlineCode",{parentName:"p"},"Optional")," ",(0,l.kt)("strong",{parentName:"p"},"git"),": ",(0,l.kt)("inlineCode",{parentName:"p"},"SimpleGitOptions")),(0,l.kt)("p",null,"The Git settings to use"),(0,l.kt)("h4",{id:"defined-in-5"},"Defined in"),(0,l.kt)("p",null,(0,l.kt)("a",{parentName:"p",href:"https://github.com/Resnovas/smartcloud/blob/b9e22a9/src/index.ts#L153"},"src/index.ts:153")),(0,l.kt)("hr",null),(0,l.kt)("h3",{id:"ref"},"ref"),(0,l.kt)("p",null,"\u2022 ",(0,l.kt)("inlineCode",{parentName:"p"},"Optional")," ",(0,l.kt)("strong",{parentName:"p"},"ref"),": ",(0,l.kt)("inlineCode",{parentName:"p"},"string")),(0,l.kt)("p",null,"The ref to use"),(0,l.kt)("h4",{id:"defined-in-6"},"Defined in"),(0,l.kt)("p",null,(0,l.kt)("a",{parentName:"p",href:"https://github.com/Resnovas/smartcloud/blob/b9e22a9/src/index.ts#L157"},"src/index.ts:157")),(0,l.kt)("hr",null),(0,l.kt)("h3",{id:"repo"},"repo"),(0,l.kt)("p",null,"\u2022 ",(0,l.kt)("inlineCode",{parentName:"p"},"Optional")," ",(0,l.kt)("strong",{parentName:"p"},"repo"),": ",(0,l.kt)("a",{parentName:"p",href:"/smartcloud/docs/smartcloud/interfaces/Repo"},(0,l.kt)("inlineCode",{parentName:"a"},"Repo"))),(0,l.kt)("p",null,"The repo to use"),(0,l.kt)("h4",{id:"defined-in-7"},"Defined in"),(0,l.kt)("p",null,(0,l.kt)("a",{parentName:"p",href:"https://github.com/Resnovas/smartcloud/blob/b9e22a9/src/index.ts#L149"},"src/index.ts:149")),(0,l.kt)("hr",null),(0,l.kt)("h3",{id:"showlogs"},"showLogs"),(0,l.kt)("p",null,"\u2022 ",(0,l.kt)("strong",{parentName:"p"},"showLogs"),": ",(0,l.kt)("inlineCode",{parentName:"p"},"boolean")),(0,l.kt)("p",null,"Should show logs?"),(0,l.kt)("h4",{id:"defined-in-8"},"Defined in"),(0,l.kt)("p",null,(0,l.kt)("a",{parentName:"p",href:"https://github.com/Resnovas/smartcloud/blob/b9e22a9/src/index.ts#L133"},"src/index.ts:133")),(0,l.kt)("hr",null),(0,l.kt)("h3",{id:"skipdelete"},"skipDelete"),(0,l.kt)("p",null,"\u2022 ",(0,l.kt)("strong",{parentName:"p"},"skipDelete"),": ",(0,l.kt)("inlineCode",{parentName:"p"},"boolean")),(0,l.kt)("p",null,"Should skip delete of labels"),(0,l.kt)("h4",{id:"defined-in-9"},"Defined in"),(0,l.kt)("p",null,(0,l.kt)("a",{parentName:"p",href:"https://github.com/Resnovas/smartcloud/blob/b9e22a9/src/index.ts#L145"},"src/index.ts:145")))}f.isMDXComponent=!0}}]);