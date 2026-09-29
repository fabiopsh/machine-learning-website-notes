import type { MDXComponents } from 'mdx/types'
import type { ComponentProps, ReactNode } from 'react'
import { Card, Cards, Event, Step, Steps, Timeline } from '../prose/Blocks'
import { Callout, Deep } from '../prose/Callout'
import { Caption, Exam, Figure, Q } from '../prose/Figure'
import { Formula } from '../prose/Formula'
import { T } from '../prose/Term'
import { Tex } from '../prose/Tex'

function H2({ id, children, ...rest }: ComponentProps<'h2'>) {
  return (
    <h2 id={id} {...rest}>
      {children}
      {id && (
        <a className="h-anchor" href={`#${id}`} aria-hidden="true" tabIndex={-1} data-anchor={id}>
          #
        </a>
      )}
    </h2>
  )
}

function H3({ id, children, ...rest }: ComponentProps<'h3'>) {
  return (
    <h3 id={id} {...rest}>
      {children}
      {id && (
        <a className="h-anchor" href={`#${id}`} aria-hidden="true" tabIndex={-1} data-anchor={id}>
          #
        </a>
      )}
    </h3>
  )
}

function Table(props: ComponentProps<'table'>) {
  return (
    <div className="table-wrap">
      <table {...props} />
    </div>
  )
}

function A({ href = '', ...rest }: ComponentProps<'a'>) {
  const external = /^https?:/.test(href)
  return <a href={href} {...rest} {...(external ? { target: '_blank', rel: 'noreferrer' } : {})} />
}

function Lead({ children }: { children: ReactNode }) {
  return <p className="lead">{children}</p>
}

export const mdxComponents: MDXComponents = {
  Lead,
  h2: H2,
  h3: H3,
  table: Table,
  a: A,
  hr: () => <hr className="section-rule" />,
  Callout,
  Deep,
  Formula,
  T,
  Tex,
  Figure,
  Caption,
  Exam,
  Q,
  Timeline,
  Event,
  Steps,
  Step,
  Cards,
  Card,
}
