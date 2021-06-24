
# check choco is installed
# remove existing choco
Remove-Item $env:ChocolateyInstall -Recurse -Force
# # install choco
Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://chocolatey.org/install.ps1'))
# # 
choco feature enable -n=allowGlobalConfirmation

$node_version = (node -v)

if ($node_version) {
    write-host "[NODE] remove existing nodejs $node_version"
    choco uninstall nodejs-lts -y
} 

choco install nodejs-lts -y

refreshenv

npm install pm2@latest -g
