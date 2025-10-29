package game

import "errors"

const (
	Rows    = 6
	Columns = 7

	Empty   = 2
	Player1 = 0 // Rouge
	Player2 = 1 // Noir
)

type Board struct {
	Grid [Rows][Columns]int `json:"grid"`
}

func NewBoard() *Board {
	b := &Board{}
	b.Reset()
	return b
}

func (b *Board) Reset() {
	for i := 0; i < Rows; i++ {
		for j := 0; j < Columns; j++ {
			b.Grid[i][j] = Empty
		}
	}
}

// DropToken insère un jeton dans la colonne et retourne (row, col)
func (b *Board) DropToken(col, player int) (int, int, error) {
	if col < 0 || col >= Columns {
		return -1, -1, errors.New("colonne invalide")
	}
	for row := Rows - 1; row >= 0; row-- {
		if b.Grid[row][col] == Empty {
			b.Grid[row][col] = player
			return row, col, nil
		}
	}
	return -1, -1, errors.New("colonne pleine")
}

func (b *Board) IsFull() bool {
	for j := 0; j < Columns; j++ {
		if b.Grid[0][j] == Empty {
			return false
		}
	}
	return true
}
