import { availableLessons, getLesson, lessonStats, lessons, parts } from '../content/lessons'
import { lastVisited, useProgress } from '../lib/progress'
import { glossaryHref, lessonHref } from '../lib/router'
import { Icon } from '../components/ui/Icon'
import { CourseMap } from '../widgets/l01/CourseMap'
import { HeroFit } from '../widgets/HeroFit'

export function Home() {
  const progress = useProgress()
  const last = lastVisited(progress)
  const lastLesson = last ? getLesson(last) : undefined
  const resume = lastLesson?.load && !progress[last!]?.done ? lastLesson : undefined

  return (
    <div className="page page--home">
      <section className="hero">
        <div className="hero__text">
          <p className="hero__eyebrow">Università di Pisa · Laurea Magistrale in Informatica · a.a. 2026/27</p>
          <h1 className="hero__title">
            Machine Learning,
            <br />
            <em>un esempio alla volta.</em>
          </h1>
          <p className="hero__lead">
            Gli appunti del corso 654AA del Prof. Alessio Micheli, riscritti per essere esplorati: ogni formula si
            spiega, ogni figura si può toccare, ogni termine rimanda alla sua definizione.
          </p>
          <div className="hero__cta">
            {resume ? (
              <a className="btn btn--solid btn--lg" href={lessonHref(resume.id)}>
                Riprendi: {resume.id} · {resume.title}
                <Icon name="arrowRight" size={17} />
              </a>
            ) : (
              <a className="btn btn--solid btn--lg" href={lessonHref('01')}>
                Inizia dalla lezione 1
                <Icon name="arrowRight" size={17} />
              </a>
            )}
            <a className="btn btn--ghost btn--lg" href={glossaryHref()}>
              Glossario
            </a>
          </div>
          <p className="hero__credits">Appunti di Fabio Piscitelli</p>
        </div>
        <div className="hero__figure">
          <HeroFit />
        </div>
      </section>

      <section className="index" aria-labelledby="idx-title">
        <div className="section-head">
          <h2 id="idx-title">Le lezioni</h2>
          <p>
            Il corso ha una struttura forte: si parte dai modelli semplici per arrivare allo stato dell’arte.
            {availableLessons.length < lessons.length &&
              ` Per ora ne sono disponibili ${availableLessons.length} su ${lessons.length}; le altre arriveranno presto.`}
          </p>
        </div>
        {parts.map((part) => (
          <div className="index__part" key={part.roman}>
            <div className="index__part-head">
              <span className="index__roman">{part.roman}</span>
              <span className="index__part-title">{part.title}</span>
            </div>
            <ol className="index__list">
              {part.lessons.map((l) => {
                const st = lessonStats(l.id)
                const p = progress[l.id]
                if (!l.load) {
                  return (
                    <li key={l.id} className="index__row is-locked">
                      <span className="index__num">{l.id}</span>
                      <span className="index__body">
                        <span className="index__title">{l.title}</span>
                      </span>
                      <span className="index__meta">in preparazione</span>
                    </li>
                  )
                }
                return (
                  <li key={l.id}>
                    <a className="index__row" href={lessonHref(l.id)}>
                      <span className="index__num">{l.id}</span>
                      <span className="index__body">
                        <span className="index__eyebrow">{l.eyebrow}</span>
                        <span className="index__title">{l.title}</span>
                        {l.summary && <span className="index__summary">{l.summary}</span>}
                      </span>
                      <span className="index__meta">
                        {st && <span>{st.minutes} min</span>}
                        {st && st.figures > 0 && <span>{st.figures === 1 ? '1 figura' : `${st.figures} figure`}</span>}
                        {p?.done ? (
                          <span className="index__done">
                            <Icon name="check" size={13} strokeWidth={2.2} /> letta
                          </span>
                        ) : p && p.pct > 0.03 ? (
                          <span className="index__pct">{Math.round(p.pct * 100)}%</span>
                        ) : null}
                      </span>
                      <Icon name="arrowRight" size={18} className="index__go" />
                    </a>
                  </li>
                )
              })}
            </ol>
          </div>
        ))}
      </section>

      <section className="home-map" aria-labelledby="map-title">
        <div className="section-head">
          <h2 id="map-title">La mappa del corso</h2>
          <p>
            Non è solo un ordine delle lezioni: descrive il percorso. Si introducono dei “mattoni” che poi vengono
            composti per costruire i modelli di ML. Passa sui riquadri per vedere i collegamenti.
          </p>
        </div>
        <CourseMap />
      </section>

      <section className="howto" aria-labelledby="howto-title">
        <div className="section-head">
          <h2 id="howto-title">Come leggere questi appunti</h2>
        </div>
        <ul className="howto__grid">
          <li>
            <span className="howto__demo">
              <span className="term term--demo">overfitting</span>
            </span>
            <strong>Termini</strong>
            <span>Le parole con la sottolineatura a puntini aprono la definizione e il link alla lezione in cui sono spiegate.</span>
          </li>
          <li>
            <span className="howto__demo howto__demo--formula">
              ∇<i>f</i>
            </span>
            <strong>Formule</strong>
            <span>Passa sopra ai simboli per leggerne il significato; sotto trovi come si legge la formula e il ragionamento.</span>
          </li>
          <li>
            <span className="howto__demo">
              <span className="howto__handle" />
            </span>
            <strong>Figure</strong>
            <span>Tutto ciò che ha il colore d’accento si può trascinare o regolare. I suggerimenti “Prova a…” si spuntano da soli.</span>
          </li>
          <li>
            <span className="howto__demo">
              <kbd>Ctrl</kbd>
              <kbd>K</kbd>
            </span>
            <strong>Ricerca</strong>
            <span>Trova lezioni, sezioni, figure e termini da qualsiasi pagina. Anche il tasto “/” apre la ricerca.</span>
          </li>
        </ul>
      </section>
    </div>
  )
}
