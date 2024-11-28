import { html } from 'lithen-fns'

export function swordSlashEl() {
  return html`
    <div
      on-animationend=${(event: Event) => {
        const target = event.currentTarget as HTMLElement
        target.classList.remove('slash')
      }}
      class="slash"
    ></div>
  `
}
