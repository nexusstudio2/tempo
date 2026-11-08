$ErrorActionPreference = "Stop"

$repositoryRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$environmentFile = Join-Path $repositoryRoot ".env"
$apiDirectory = Join-Path $repositoryRoot "services\api"

if (-not (Test-Path -LiteralPath $environmentFile)) {
    throw "No existe .env en la raíz. Cópialo desde .env.example y completa las contraseñas locales."
}

foreach ($line in Get-Content -LiteralPath $environmentFile) {
    if ($line -match '^\s*(#.*)?$') { continue }
    if ($line -notmatch '^\s*([A-Za-z_][A-Za-z0-9_]*)=(.*)$') {
        throw "La línea del archivo .env no tiene el formato CLAVE=VALOR."
    }

    $name = $Matches[1]
    $value = $Matches[2].Trim()
    if ($value.Length -ge 2 -and $value.StartsWith('"') -and $value.EndsWith('"')) {
        $value = $value.Substring(1, $value.Length - 2)
    }
    [Environment]::SetEnvironmentVariable($name, $value, "Process")
}

if ([string]::IsNullOrWhiteSpace($env:DB_PASSWORD)) {
    throw "DB_PASSWORD está vacío en .env. Define una contraseña local para la base de datos."
}

Push-Location $apiDirectory
try {
    mvn spring-boot:run
    exit $LASTEXITCODE
}
finally {
    Pop-Location
}
