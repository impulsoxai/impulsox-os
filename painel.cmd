@echo off
REM Painel ImpulsoX-OS — dois cliques: sobe o servidor local e abre o navegador.
REM Deixe esta janela aberta enquanto usa o painel. Feche para desligar.
title Painel ImpulsoX-OS
cd /d "%~dp0"
start "" http://127.0.0.1:5173
echo Painel ImpulsoX-OS em http://127.0.0.1:5173
echo Deixe esta janela aberta. Feche para desligar.
node dashboard\servidor.mjs
