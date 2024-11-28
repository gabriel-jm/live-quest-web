import { explosion } from './animations/explosion'
import { swordSlashEl } from './animations/sword-slash'
import './main.css'
import { el, html, ref, signal } from 'lithen-fns'

const player: Character = {
  hp: 100,
  currentHp: 100,
  attributes: {
    strength: 10,
    dexterity: 10,
    intelligence: 10,
  }
}

const swordSlashSFX = new Audio('/sfx/sword-slash.mp3')
swordSlashSFX.volume = 0.65

class Enemy {
  hp = 100
  #currentHp = 100
  #onDmgListener: ((amount: number) => void) | null = null
  #onDeathListener: (() => void) | null = null

  get currentHp() {
    return this.#currentHp
  }

  set currentHp(hp: number) {
    this.#currentHp = Math.max(0, hp)
    if (this.#currentHp === 0) {
      this.#onDeathListener?.()
    }
  }
  
  onDamage(listener: (amount: number) => void) {
    this.#onDmgListener = listener
  }

  damage(amount: number) {
    this.#onDmgListener?.(amount)
    this.currentHp -= amount
  }

  onDeath(listener: () => void) {
    this.#onDeathListener = listener
  }
}

type Character = {
  hp: number,
  currentHp: number,
  attributes?: {
    strength: number,
    dexterity: number,
    intelligence: number,
  }
}

class Combat {
  turnOrder: Character[] = []

  constructor(...characters: Character[]) {
    const initiatives = characters.map(character => {
      return {
        character,
        initiative: Math.floor(Math.random() * 20)
      }
    })

    this.turnOrder = initiatives
      .toSorted((a, b) => b.initiative - a.initiative)
      .map(initiative => initiative.character)
  }
}

function component() {
  const enemies: Enemy[] = [new Enemy(), new Enemy()]
  let target = enemies[0]
  const targetRef = ref<HTMLElement>()

  new Combat(player, ...enemies)

  function attack(event: Event) {
    const btn = event.currentTarget as HTMLButtonElement

    if (btn.disabled) return

    btn.disabled = true

    swordSlashSFX.addEventListener('ended', () => {
      btn.disabled = false
    })
    
    swordSlashSFX.play()
    
    target.damage(player.attributes?.strength ?? 0)

    targetRef.el?.append(swordSlashEl())
  }

  function changeTarget(enemy: Enemy) {
    return (event: Event) => {
      if (enemy.currentHp === 0) {
        return
      }

      target = enemy
      const currentTarget = event.currentTarget as HTMLElement
      targetRef.el?.classList.remove('targeted')
      currentTarget.classList.add('targeted')
      targetRef.el = currentTarget
    }
  }

  return html`
    <h1>Live Quest</h1>

    <div>
      <div class="character-card">
        <h1>Player</h1>
        <p>HP: ${player.hp}</p>
        <button on-click=${attack}>
          Attack
        </button>
      </div>

      <div style="display: flex; gap: 1rem; cursor: pointer;">
        ${enemies.map((data, index) => {
          const enemyEl = newEnemy(data, index, changeTarget(data))

          if (index === 0) {
            targetRef.el = enemyEl as HTMLElement
          }

          return enemyEl
        })}
      </div>

      ${explosion()}
    </div>
  `
}

function newEnemy(enemyData: Enemy, index: number, onClick: Function) {
  const nameRef = ref<HTMLParagraphElement>()
  const hp = signal(enemyData.hp)

  enemyData.onDamage((amount) => {
    hp.set(curr => {
      const newCurr = curr - amount

      return Math.max(0, newCurr)
    })
  })

  enemyData.onDeath(() => {
    nameRef.el?.classList.add('line-through')
  }) 

  return el/*html*/`
    <div
      class="character-card ${index === 0 && 'targeted'}"
      on-click=${onClick}
    >
      <h1 ref=${nameRef}>Enemy ${index + 1}</h1>
      <p>HP: ${hp}</p>
    </div>
  `
}

document.body.querySelector('#app')?.append(component())
