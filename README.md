## COMPLOT: A WebGL Based Visualizer for Complex Functions

COMPLOT allows the user to interact with phase portraits of complex functions, also called domain colorings. Wikipedia provides an [reasonable overview](https://en.wikipedia.org/wiki/Domain_coloring) of what a phase portrait is and how it can be interpreted, but the best discription and exloration of these visualizations I know of is contained in [Visual Complex Functions: An Introduction with Phase Portraits](https://www.amazon.com/Visual-Complex-Functions-Introduction-Portraits/dp/3034801793/ref=sr_1_2?crid=3PHO9QLXWT3C4&keywords=visual+complex+functions+an+introduction+with+phase+portraits&qid=1645144354&sprefix=complex+functions+phase+po%2Caps%2C79&sr=8-2) by Elias Wegert.

When the user enters a function, it is instantly translated into a WebGL shader and compiled, enabling ultra-smooth panning and zooming.

See it live on GitHub Pages: 
https://peterallenwebb.github.io/COMPLOT/#(z%2F2)%5E3%2B(z%2F3)%5E2-4*z#1
https://peterallenwebb.github.io/COMPLOT/#sin(z)
https://peterallenwebb.github.io/COMPLOT/#sin(z)%2Fcos(z)#1