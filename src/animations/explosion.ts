import './explosion.css'
import { css, html, ref } from 'lithen-fns'

export function explosion() {
  const waveDiv = ref<HTMLDivElement>()

  const styles = css`
    &.particle {
      --start-color: red;
      --end-color: orange;

      width: 10px;
      height: 10px;
      border-radius: 50%;
      background-color: red;
      animation: anim 800ms ease-out forwards;
      animation-delay: 600ms;
      animation-play-state: paused;
    }
  `
  
  return html`
    <div css=${styles} class="particle"></div>
    <div ref=${waveDiv} class="wave"></div>
    <button on-click=${() => {
      waveDiv.el?.classList.remove('wave')
      setTimeout(() => waveDiv.el?.classList.add('wave'))
    }}>
      play wave
    </button>
  `
}
