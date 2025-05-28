; Define the Chrome path
ChromePath := "C:\Program Files\Google\Chrome\Application\chrome.exe"

; Launch Chrome in app mode with the specified URL
Run, %ChromePath% --app=http://www.youtube.com/tv, , UseErrorLevel, PID

; Wait for the Chrome window to be fully open and activated
WinWait, ahk_class Chrome_WidgetWin_1,, 10  ; Wait up to 10 seconds
WinActivate, ahk_class Chrome_WidgetWin_1

; Move the Chrome window to monitor 3
SysGet, Monitor3, Monitor, 3
Monitor3Width := Monitor3Right - Monitor3Left
Monitor3Height := Monitor3Bottom - Monitor3Top

; Use a loop to make sure Chrome moves to monitor 3
Loop, 5
{
    ; Move the window to monitor 3
    WinMove, ahk_class Chrome_WidgetWin_1, , Monitor3Left, Monitor3Top, Monitor3Width, Monitor3Height
    Sleep, 500  ; Give Chrome time to adjust its position
    ; Break if it successfully moved to monitor 3
    WinGetPos, X, Y, , , ahk_class Chrome_WidgetWin_1
    if (X >= Monitor3Left and X <= Monitor3Right and Y >= Monitor3Top and Y <= Monitor3Bottom)
        break
}

If (X < Monitor3Left or X > Monitor3Right or Y < Monitor3Top or Y > Monitor3Bottom)
{
    MsgBox, "Failed to move Chrome to monitor 3. Please try again or check monitor settings."
}

; Loop to monitor Chrome's focus and Xbox button press
Loop
{
    ; Check if Chrome is still active
    WinGet, ActivePID, PID, A
    if (ActivePID != PID)  ; If Chrome is not the active window
    {
        Process, Close, chrome.exe  ; Close Chrome
        ExitApp  ; Exit the AHK script
    }
    
    ; Check if Xbox button is pressed (assuming it's "Joy12" for the Xbox Guide button)
    if GetKeyState("Joy12")  ; Replace "Joy12" if needed based on your setup
    {
        Process, Close, chrome.exe  ; Close Chrome
        ExitApp  ; Exit the AHK script
    }
    
    Sleep, 500  ; Check every half second
}
