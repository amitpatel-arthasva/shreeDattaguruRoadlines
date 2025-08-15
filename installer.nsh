!macro customInstall
  SetRegView 64
  WriteRegStr HKLM "SOFTWARE\Microsoft\Windows NT\CurrentVersion\AppCompatFlags\Layers" "$INSTDIR\Shree Dattagu Roadlines.exe" "RUNASADMIN"
!macroend

!macro customUnInstall
  SetRegView 64
  DeleteRegValue HKLM "SOFTWARE\Microsoft\Windows NT\CurrentVersion\AppCompatFlags\Layers" "$INSTDIR\Shree Dattagu Roadlines.exe"
!macroend
