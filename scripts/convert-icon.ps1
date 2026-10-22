Add-Type -AssemblyName System.Drawing

$src = "C:\Users\panna\.gemini\antigravity-ide\brain\23f52be1-9ed7-4132-ab60-fad4b6bf32ab\care_bed_icon_1792638733374.jpg"
$dest = "c:\Projects\Project_ThaiCareCenter\Project_YooDeeHomeCare\public\images\bed-icon.png"

if (Test-Path $src) {
    $bmp = [System.Drawing.Bitmap]::FromFile($src)
    $w = $bmp.Width
    $h = $bmp.Height
    
    # Breadth-first search flood fill transparency from the 4 corners
    $visited = New-Object 'bool[,]' $w, $h
    $queue = New-Object System.Collections.Queue
    
    # Enqueue borders
    for ($x = 0; $x -lt $w; $x++) {
        $queue.Enqueue([System.Drawing.Point]::new($x, 0))
        $queue.Enqueue([System.Drawing.Point]::new($x, $h - 1))
        $visited[$x, 0] = $true
        $visited[$x, $h - 1] = $true
    }
    for ($y = 0; $y -lt $h; $y++) {
        $queue.Enqueue([System.Drawing.Point]::new(0, $y))
        $queue.Enqueue([System.Drawing.Point]::new($w - 1, $y))
        $visited[0, $y] = $true
        $visited[$w - 1, $y] = $true
    }
    
    while ($queue.Count -gt 0) {
        $pt = $queue.Dequeue()
        $px = $pt.X
        $py = $pt.Y
        $col = $bmp.GetPixel($px, $py)
        
        # If near white, make transparent and explore neighbors
        if ($col.R -ge 240 -and $col.G -ge 240 -and $col.B -ge 240) {
            $bmp.SetPixel($px, $py, [System.Drawing.Color]::FromArgb(0, 255, 255, 255))
            
            # Check 4 neighbors
            $dx = @(0, 0, 1, -1)
            $dy = @(1, -1, 0, 0)
            for ($i = 0; $i -lt 4; $i++) {
                $nx = $px + $dx[$i]
                $ny = $py + $dy[$i]
                if ($nx -ge 0 -and $nx -lt $w -and $ny -ge 0 -and $ny -lt $h) {
                    if (-not $visited[$nx, $ny]) {
                        $visited[$nx, $ny] = $true
                        $queue.Enqueue([System.Drawing.Point]::new($nx, $ny))
                    }
                }
            }
        }
    }
    
    $bmp.Save($dest, [System.Drawing.Imaging.ImageFormat]::Png)
    $bmp.Dispose()
    Write-Output "SUCCESS_FLOOD_FILL"
} else {
    Write-Error "Source not found"
}
