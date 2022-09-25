"use strict";(self.webpackChunksmartcloud=self.webpackChunksmartcloud||[]).push([[9672],{3905:function(e,n,t){t.d(n,{Zo:function(){return u},kt:function(){return f}});var r=t(7294);function i(e,n,t){return n in e?Object.defineProperty(e,n,{value:t,enumerable:!0,configurable:!0,writable:!0}):e[n]=t,e}function o(e,n){var t=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);n&&(r=r.filter((function(n){return Object.getOwnPropertyDescriptor(e,n).enumerable}))),t.push.apply(t,r)}return t}function l(e){for(var n=1;n<arguments.length;n++){var t=null!=arguments[n]?arguments[n]:{};n%2?o(Object(t),!0).forEach((function(n){i(e,n,t[n])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(t)):o(Object(t)).forEach((function(n){Object.defineProperty(e,n,Object.getOwnPropertyDescriptor(t,n))}))}return e}function a(e,n){if(null==e)return{};var t,r,i=function(e,n){if(null==e)return{};var t,r,i={},o=Object.keys(e);for(r=0;r<o.length;r++)t=o[r],n.indexOf(t)>=0||(i[t]=e[t]);return i}(e,n);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);for(r=0;r<o.length;r++)t=o[r],n.indexOf(t)>=0||Object.prototype.propertyIsEnumerable.call(e,t)&&(i[t]=e[t])}return i}var c=r.createContext({}),d=function(e){var n=r.useContext(c),t=n;return e&&(t="function"==typeof e?e(n):l(l({},n),e)),t},u=function(e){var n=d(e.components);return r.createElement(c.Provider,{value:n},e.children)},s={inlineCode:"code",wrapper:function(e){var n=e.children;return r.createElement(r.Fragment,{},n)}},p=r.forwardRef((function(e,n){var t=e.components,i=e.mdxType,o=e.originalType,c=e.parentName,u=a(e,["components","mdxType","originalType","parentName"]),p=d(t),f=i,m=p["".concat(c,".").concat(f)]||p[f]||s[f]||o;return t?r.createElement(m,l(l({ref:n},u),{},{components:t})):r.createElement(m,l({ref:n},u))}));function f(e,n){var t=arguments,i=n&&n.mdxType;if("string"==typeof e||i){var o=t.length,l=new Array(o);l[0]=p;var a={};for(var c in n)hasOwnProperty.call(n,c)&&(a[c]=n[c]);a.originalType=e,a.mdxType="string"==typeof e?e:i,l[1]=a;for(var d=2;d<o;d++)l[d]=t[d];return r.createElement.apply(null,l)}return r.createElement.apply(null,t)}p.displayName="MDXCreateElement"},6477:function(e,n,t){t.r(n),t.d(n,{assets:function(){return u},contentTitle:function(){return c},default:function(){return f},frontMatter:function(){return a},metadata:function(){return d},toc:function(){return s}});var r=t(7462),i=t(3366),o=(t(7294),t(3905)),l=["components"],a={id:"internal.ConditionOnlyOne",title:"Interface: ConditionOnlyOne",sidebar_label:"ConditionOnlyOne",custom_edit_url:null},c=void 0,d={unversionedId:"smartcloud/interfaces/internal.ConditionOnlyOne",id:"smartcloud/interfaces/internal.ConditionOnlyOne",title:"Interface: ConditionOnlyOne",description:"internal.ConditionOnlyOne",source:"@site/docs/smartcloud/interfaces/internal.ConditionOnlyOne.md",sourceDirName:"smartcloud/interfaces",slug:"/smartcloud/interfaces/internal.ConditionOnlyOne",permalink:"/smartcloud/docs/smartcloud/interfaces/internal.ConditionOnlyOne",draft:!1,editUrl:null,tags:[],version:"current",frontMatter:{id:"internal.ConditionOnlyOne",title:"Interface: ConditionOnlyOne",sidebar_label:"ConditionOnlyOne",custom_edit_url:null},sidebar:"release",previous:{title:"ConditionNot",permalink:"/smartcloud/docs/smartcloud/interfaces/internal.ConditionNot"},next:{title:"ConditionOr",permalink:"/smartcloud/docs/smartcloud/interfaces/internal.ConditionOr"}},u={},s=[{value:"Properties",id:"properties",level:2},{value:"condition",id:"condition",level:3},{value:"Defined in",id:"defined-in",level:4},{value:"required",id:"required",level:3},{value:"Defined in",id:"defined-in-1",level:4},{value:"type",id:"type",level:3},{value:"Defined in",id:"defined-in-2",level:4}],p={toc:s};function f(e){var n=e.components,t=(0,i.Z)(e,l);return(0,o.kt)("wrapper",(0,r.Z)({},p,t,{components:n,mdxType:"MDXLayout"}),(0,o.kt)("p",null,(0,o.kt)("a",{parentName:"p",href:"/smartcloud/docs/smartcloud/modules/internal"},"internal"),".ConditionOnlyOne"),(0,o.kt)("h2",{id:"properties"},"Properties"),(0,o.kt)("h3",{id:"condition"},"condition"),(0,o.kt)("p",null,"\u2022 ",(0,o.kt)("strong",{parentName:"p"},"condition"),": [",(0,o.kt)("a",{parentName:"p",href:"/smartcloud/docs/smartcloud/interfaces/PRConditionConfig"},(0,o.kt)("inlineCode",{parentName:"a"},"PRConditionConfig"))," ","|"," ",(0,o.kt)("a",{parentName:"p",href:"/smartcloud/docs/smartcloud/interfaces/IssueConditionConfig"},(0,o.kt)("inlineCode",{parentName:"a"},"IssueConditionConfig"))," ","|"," ",(0,o.kt)("a",{parentName:"p",href:"/smartcloud/docs/smartcloud/interfaces/ProjectConditionConfig"},(0,o.kt)("inlineCode",{parentName:"a"},"ProjectConditionConfig")),"]"),(0,o.kt)("h4",{id:"defined-in"},"Defined in"),(0,o.kt)("p",null,(0,o.kt)("a",{parentName:"p",href:"https://github.com/Resnovas/smartcloud/blob/b9e22a9/src/conditions/util/only.ts#L17"},"src/conditions/util/only.ts:17")),(0,o.kt)("hr",null),(0,o.kt)("h3",{id:"required"},"required"),(0,o.kt)("p",null,"\u2022 ",(0,o.kt)("strong",{parentName:"p"},"required"),": ",(0,o.kt)("inlineCode",{parentName:"p"},"number")),(0,o.kt)("h4",{id:"defined-in-1"},"Defined in"),(0,o.kt)("p",null,(0,o.kt)("a",{parentName:"p",href:"https://github.com/Resnovas/smartcloud/blob/b9e22a9/src/conditions/util/only.ts#L15"},"src/conditions/util/only.ts:15")),(0,o.kt)("hr",null),(0,o.kt)("h3",{id:"type"},"type"),(0,o.kt)("p",null,"\u2022 ",(0,o.kt)("strong",{parentName:"p"},"type"),": ",(0,o.kt)("inlineCode",{parentName:"p"},'"$only"')),(0,o.kt)("h4",{id:"defined-in-2"},"Defined in"),(0,o.kt)("p",null,(0,o.kt)("a",{parentName:"p",href:"https://github.com/Resnovas/smartcloud/blob/b9e22a9/src/conditions/util/only.ts#L16"},"src/conditions/util/only.ts:16")))}f.isMDXComponent=!0}}]);