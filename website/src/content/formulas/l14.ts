import type { FormulaDef } from '../../components/prose/Formula'

const r = String.raw

export const kernelDist: FormulaDef = {
  name: 'Distanza indotta dal kernel',
  tex: r`d_k(\mathbf{s}, \mathbf{t})^2 = \part{ss}{k(\mathbf{s}, \mathbf{s})} - 2\part{st}{k(\mathbf{s}, \mathbf{t})} + k(\mathbf{t}, \mathbf{t}) = \part{phi}{\|\Phi(\mathbf{s}) - \Phi(\mathbf{t})\|^2}`,
  parts: [
    {
      k: 'ss',
      sym: r`k(\mathbf{s}, \mathbf{s})`,
      desc: r`il kernel di un oggetto con sé stesso: la norma al quadrato della sua immagine, $\|\Phi(\mathbf{s})\|^2$`,
    },
    { k: 'st', sym: r`k(\mathbf{s}, \mathbf{t})`, desc: r`il prodotto scalare tra le due immagini: più è alto, più la distanza è piccola` },
    {
      k: 'phi',
      sym: r`\|\Phi(\mathbf{s}) - \Phi(\mathbf{t})\|^2`,
      desc: r`la distanza vera nello spazio delle feature, calcolata senza mai costruire $\Phi$`,
    },
  ],
  read: r`«d k di s e t al quadrato è k di s s meno due k di s t più k di t t, cioè la norma al quadrato di phi di s meno phi di t».`,
  why: r`È lo sviluppo del quadrato $\|\mathbf{a} - \mathbf{b}\|^2 = \mathbf{a}^T\mathbf{a} - 2\mathbf{a}^T\mathbf{b} + \mathbf{b}^T\mathbf{b}$ con $\mathbf{a} = \Phi(\mathbf{s})$, $\mathbf{b} = \Phi(\mathbf{t})$, dove ogni prodotto scalare è un kernel. Per questo un kernel si legge come **similarità**: valore alto, oggetti vicini.`,
}
