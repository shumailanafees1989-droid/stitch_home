$port = 5500
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$port/")
$listener.Start()
Write-Host "Server running at http://localhost:$port/"

$root = $PSScriptRoot

while ($listener.IsListening) {
    $context = $listener.GetContext()
    $req = $context.Request
    $res = $context.Response
    
    $path = $req.Url.LocalPath.TrimStart('/')
    if ([string]::IsNullOrWhiteSpace($path)) {
        $path = "index.html"
    }
    
    $fullPath = Join-Path $root $path
    
    if (Test-Path $fullPath -PathType Leaf) {
        $bytes = [System.IO.File]::ReadAllBytes($fullPath)
        $ext = [System.IO.Path]::GetExtension($fullPath)
        $type = "text/plain"
        switch ($ext) {
            ".html" { $type = "text/html" }
            ".css"  { $type = "text/css" }
            ".js"   { $type = "application/javascript" }
            ".png"  { $type = "image/png" }
            ".jpg"  { $type = "image/jpeg" }
            ".json" { $type = "application/json" }
        }
        $res.ContentType = $type
        $res.ContentLength64 = $bytes.Length
        $res.OutputStream.Write($bytes, 0, $bytes.Length)
    } else {
        $res.StatusCode = 404
    }
    $res.Close()
}
