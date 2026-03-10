title: 📖 M365 이름 일괄변경 방법
tags: [m365, powershell]
date: 2026-03-10
---
# Powershell_M365 이름변경 방법

## 1. [필수] PowerShell 환경 설정

PowerShell을 통해 MS365 관리자 작업을 하기 위해서는 아래의 환경 설정을 **'최초 1회'** 반드시 실행해야 합니다.

이 모듈은 기존의 Azure AD 또는 Msol 모듈을 대체하며, 향후 마이크로소프트가 권장하는 방식입니다.

### 관리 환경을 세팅하는 과정 (Windows 11 64비트 기준)

1. 윈도우 검색 창에서 PowerShell 을 입력하여 검색한 후 마우스 우클릭하여 관리자 권한으로 실행합니다.

2. PowerShell 명령 프롬프트가 열립니다.

3. 아래 명령을 실행하여 **Microsoft Graph PowerShell 모듈**을 설치합니다.
    ```powershell
    Install-Module -Name Microsoft.Graph -Scope CurrentUser
    ```
    > 설치를 계속하려면 예(Y) 또는 모두 예(A)를 선택합니다. 
    👉모듈설치에는 수분~10분 정도의 시간이 소요됩니다. 반응이 없는 것 같아도 기다리시면 설치가 완료됩니다.

    ![image](/images/m365/powershellsetting/image1.png)

4. 아래 명령을 실행하여 설치된 모듈을 임포트합니다.
    ```powershell
    Import-Module Microsoft.Graph.Users
    ```

💡만약 설치는 정상적으로 되었으나 모듈 Import할 때 다음과 같이 빨간 텍스트로 오류가 발생한다면,

> Import-Module : 이 시스템에서 스크립트를 실행할 수 없으므로 C:\Users\sanggeunlee\OneDrive - Microsoft\Documents\Windows PowerShell\Modules\Microsoft.Graph.Authentication\2.35.1\Microsoft.Graph.Authentication.psm1 파일을 로드할 수 없습니다.

PowerShell이 외부 모듈 실행을 차단하는 것일 확률이 높습니다. 이때의 일반적인 해결 방법은 다음과 같습니다.

1. 아래 명령을 실행합니다.
    ```powershell
    Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
    ```
2. 실행하면 보통 아래와 같이 물어봅니다. 
    > Execution Policy Change [Y] Yes  [A] Yes to All  [N] No

    👉 Y 또는 A 입력

3. 아래 명령을 실행하여 상태를 확인합니다.
    ```powershell
    Get-ExecutionPolicy –List
    ```
4. 정상이라면 아래와 같은 항목을 확인할 수 있습니다.
    > CurrentUser  RemoteSigned
    
    이 상태라면 모듈을 Import할 수 있는 상태입니다.

5. 다시 모듈을 임포트합니다.
    ```powershell
    Import-Module Microsoft.Graph.Users
    ```
## 2. 표시 이름 일괄 변경 [PowerShell]

**PowerShell로 표시 이름을 일괄 변경하는 방법**

1. 변경하고자 하는 정보가 담긴 csv 파일을 생성합니다. 
샘플 csv 파일을 첨부합니다. 
userPrincipalName은 사용자의 계정을, displayName은 변경하고자 하는 표시 이름을 입력합니다.
[MS365 디스플레이 이름_Sample.csv](/attach/powershellsetting/ms365_displayname_Sample.csv)

2. 윈도우 검색 창에서 PowerShell 을 입력하여 검색한 후 마우스 우클릭하여 관리자 권한으로 실행합니다.

3. PowerShell 명령 프롬프트가 열립니다.

4. 아래 명령을 실행하여 Microsoft Graph에 연결합니다.
    ```powershell
    Connect-MgGraph -Scopes "User.ReadWrite.All"
    ```
5. 아래 명령을 실행하여 CSV 파일의 경로를 지정합니다.
    ```powershell
    $csvPath = "C:\Users\MS365Sample.csv"
    ```
    위 경로를 csv 파일의 현재 경로로 입력해주시면 됩니다.

6. 아래 명령을 실행하여 CSV 파일을 불러옵니다. 
    ```powershell
    $users = Import-Csv -Path $csvPath
    ````

7.  아래 명령을 실행하여 표시이름을 업데이트합니다. 
    ```powershell
    foreach ($user in $users) {

    try {

    Update-MgUser -UserId $user.UserPrincipalName `

    -DisplayName $user.DisplayName

    Write-Host "$($user.UserPrincipalName) updated to '$($user.DisplayName)'"

    } catch {

    Write-Host "Failed: $($user.UserPrincipalName) – $($_.Exception.Message)"

    }

    } 
    ```
 
### Tip
일괄 작업은 시간이 조금 걸립니다. 특히 변경 대상의 수가 많을수록 더 오랜 시간이 소요됩니다.

프롬프트 입력 후 작업이 멈춘듯 보일 수 있으나 그대로 기다리면 작업이 완료되는 것을 확인할 수 있습니다.

8. 업데이트 된 내용을 확인할 수 있습니다.

