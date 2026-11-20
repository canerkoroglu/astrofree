// Drop-in replacement for <select>: same props and <option> children, drawn with the app's
// own list (MenuSelect) so every dropdown looks and behaves alike. A hidden native <select>
// mirrors the value for forms, screen readers and tests; changes on it are passed through.
import { Children, isValidElement, type ReactNode, type SelectHTMLAttributes } from 'react'
import MenuSelect from './MenuSelect'

type ChangeLike = { target: { value: string }; currentTarget: { value: string } }
type Props = Omit<SelectHTMLAttributes<HTMLSelectElement>, 'onChange' | 'value'> & {
  value?: string | number
  onChange?: (e: ChangeLike) => void
  children?: ReactNode
}

const text = (n: ReactNode): string =>
  n === null || n === undefined || typeof n === 'boolean' ? '' : Array.isArray(n) ? n.map(text).join('') : isValidElement(n) ? text((n.props as { children?: ReactNode }).children) : String(n)

function collect(children: ReactNode, out: { value: string; label: string; disabled?: boolean }[] = []) {
  Children.forEach(children, (c) => {
    if (!isValidElement(c)) return
    const props = c.props as { value?: string | number; children?: ReactNode; disabled?: boolean }
    if (c.type === 'option') {
      const label = text(props.children)
      out.push({ value: props.value !== undefined ? String(props.value) : label, label, disabled: props.disabled })
    } else if (props.children) collect(props.children, out)
  })
  return out
}

export default function Select({ value, onChange, children, className = '', title, disabled, style, ...rest }: Props) {
  const options = collect(children).filter((o) => !o.disabled)
  const v = value === undefined ? (options[0]?.value ?? '') : String(value)
  const fire = (nv: string) => onChange?.({ target: { value: nv }, currentTarget: { value: nv } })
  const label = (rest['aria-label'] as string | undefined) ?? title ?? ''
  return (
    <span className={`ui-select ${className}`} style={style}>
      <select
        {...rest}
        className={`${className} ui-native`}
        value={v}
        disabled={disabled}
        tabIndex={-1}
        aria-hidden
        onChange={(e) => fire(e.target.value)}
      >
        {children}
      </select>
      <MenuSelect label={label} title={title} value={v} options={options} onChange={fire} disabled={disabled} searchable={options.length > 8} />
    </span>
  )
}
