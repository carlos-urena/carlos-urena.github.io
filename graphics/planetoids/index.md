---
usemathjax: true
---

# Procedural generation of planetoids:

<script src="https://cdn.mathjax.org/mathjax/latest/MathJax.js?config=TeX-AMS-MML_HTMLorMML" type="text/javascript"></script>


Using mathjax in github pages is easy, you just have to use the steps described here:

[https://github.blog/2022-05-19-math-support-in-markdown/](https://github.blog/2022-05-19-math-support-in-markdown/)

which does not work, perhaps we must read this:

[https://alanduan.me/random/mathjax/](https://alanduan.me/random/mathjax/)

An example equation

```math
    \int_{x\in\Omega} \frac{x^2+3}{\log x}\,dx
``` 

this is another block

\(
\newcommand{\pepeu}{z^4}
   \int_{x\in\Omega} \frac{x^2+3}{\log x}\,dx
\)

another option plus plus (this is the only one working):

$$\int_{x\in\Omega} \frac{x^2+3}{\log x}\,dx$$

and this ??

$$
   \int_{x\in\Omega} \frac{x^2+3}{\log x}\,dx
$$

and also this (with newcommand....)

\begin{equation}
  newcommand{\pepeu}{z^4}
    \int_{x\in\Omega} \frac{x^2+3}{\log x}\,dx
\end{equation}

and this is the last:

$$
   z ~=~ z~=~  \pepeu
$$

and inline as shown here $x^2$ in this line
also and inline as shown here $$x^2$$ in this line or perhaps $$2^k\,N(x/2^k)$$

```C++ 
void main( int arcg, char * argv[] )
{
    cout << "pepe" << endl ;
}
```
this is better

```cpp
void main( int arcg, char * argv[] )
{
    cout << "pepe" << endl ;
}
```



