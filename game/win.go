package game

type WinResult struct {
	Win       bool   `json:"win"`
	Player    int    `json:"player"`    // 0 (Rouge) / 1 (Noir)
	Count     int    `json:"count"`     // >=4
	Direction string `json:"direction"` // "vertical","horizontal","diag ↘","diag ↙"
}

func (b *Board) CheckWin(lastRow, lastCol, player int) WinResult {
	if lastRow < 0 || lastCol < 0 {
		return WinResult{}
	}

	directions := [][]int{
		{1, 0},  // vertical
		{0, 1},  // horizontal
		{1, 1},  // diag ↘
		{1, -1}, // diag ↙
	}

	for _, d := range directions {
		count := 1
		count += countDir(b, lastRow, lastCol, d[0], d[1], player)
		count += countDir(b, lastRow, lastCol, -d[0], -d[1], player)

		if count >= 4 {
			dir := "horizontal"
			if d[0] == 1 && d[1] == 0 {
				dir = "vertical"
			} else if d[0] == 1 && d[1] == 1 {
				dir = "diag ↘"
			} else if d[0] == 1 && d[1] == -1 {
				dir = "diag ↙"
			}
			return WinResult{Win: true, Player: player, Count: count, Direction: dir}
		}
	}
	return WinResult{}
}

func countDir(b *Board, row, col, dRow, dCol, player int) int {
	count := 0
	r := row + dRow
	c := col + dCol
	for r >= 0 && r < Rows && c >= 0 && c < Columns && b.Grid[r][c] == player {
		count++
		r += dRow
		c += dCol
	}
	return count
}
