import type { Player } from './types'

const BLANK_IMG =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAC0lEQVQI12NgAAIABQAABjE+ibYAAAAASUVORK5CYII='

export function flagSrc(code: string | null | undefined): string {
  return code ? `/flags/${code.toLowerCase()}.png` : BLANK_IMG
}

export function playerById(players: Player[], id: string): Player | undefined {
  return players.find((p) => p.id === id)
}

export function playerName(players: Player[], id: string): string {
  return playerById(players, id)?.name || '?'
}

export function pairKey(a: string, b: string): string {
  return [a, b].sort().join('|')
}

export function uid(): string {
  return Math.random().toString(36).slice(2, 10)
}

export function combinations<T>(arr: T[], k: number): T[][] {
  const res: T[][] = []
  ;(function recurse(start: number, combo: T[]) {
    if (combo.length === k) {
      res.push([...combo])
      return
    }
    for (let i = start; i < arr.length; i++) {
      combo.push(arr[i])
      recurse(i + 1, combo)
      combo.pop()
    }
  })(0, [])
  return res
}
