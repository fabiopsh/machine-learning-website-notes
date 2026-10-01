import type { FormulaDef } from '../../components/prose/Formula'
import { tx } from '../../lib/i18n'

const r = String.raw

export const kernelDist: FormulaDef = {
  name: tx('Distanza indotta dal kernel', 'Distance induced by the kernel'),
  tex: r`d_k(\mathbf{s}, \mathbf{t})^2 = \part{ss}{k(\mathbf{s}, \mathbf{s})} - 2\part{st}{k(\mathbf{s}, \mathbf{t})} + k(\mathbf{t}, \mathbf{t}) = \part{phi}{\|\Phi(\mathbf{s}) - \Phi(\mathbf{t})\|^2}`,
  parts: [
    {
      k: 'ss',
      sym: r`k(\mathbf{s}, \mathbf{s})`,
      desc: tx(
        r`il kernel di un oggetto con sé stesso: la norma al quadrato della sua immagine, $\|\Phi(\mathbf{s})\|^2$`,
        r`the kernel of an object with itself: the squared norm of its image, $\|\Phi(\mathbf{s})\|^2$`,
      ),
    },
    {
      k: 'st',
      sym: r`k(\mathbf{s}, \mathbf{t})`,
      desc: tx(
        r`il prodotto scalare tra le due immagini: più è alto, più la distanza è piccola`,
        r`the dot product between the two images: the higher it is, the smaller the distance`,
      ),
    },
    {
      k: 'phi',
      sym: r`\|\Phi(\mathbf{s}) - \Phi(\mathbf{t})\|^2`,
      desc: tx(
        r`la distanza vera nello spazio delle feature, calcolata senza mai costruire $\Phi$`,
        r`the actual distance in the feature space, computed without ever building $\Phi$`,
      ),
    },
  ],
  read: tx(
    r`«d k di s e t al quadrato è k di s s meno due k di s t più k di t t, cioè la norma al quadrato di phi di s meno phi di t».`,
    r`“d k of s and t squared is k of s s minus two k of s t plus k of t t, that is, the squared norm of phi of s minus phi of t.”`,
  ),
  why: tx(
    r`È lo sviluppo del quadrato $\|\mathbf{a} - \mathbf{b}\|^2 = \mathbf{a}^T\mathbf{a} - 2\mathbf{a}^T\mathbf{b} + \mathbf{b}^T\mathbf{b}$ con $\mathbf{a} = \Phi(\mathbf{s})$, $\mathbf{b} = \Phi(\mathbf{t})$, dove ogni prodotto scalare è un kernel. Per questo un kernel si legge come **similarità**: valore alto, oggetti vicini.`,
    r`It is the expansion of the square $\|\mathbf{a} - \mathbf{b}\|^2 = \mathbf{a}^T\mathbf{a} - 2\mathbf{a}^T\mathbf{b} + \mathbf{b}^T\mathbf{b}$ with $\mathbf{a} = \Phi(\mathbf{s})$, $\mathbf{b} = \Phi(\mathbf{t})$, where every dot product is a kernel. This is why a kernel is read as a **similarity**: high value, close objects.`,
  ),
}
