# Backend Setup Guide

## Option 1: Windows PowerShell (Recommended)

1. Open PowerShell in the backend directory:
```powershell
cd backend
```

2. Create virtual environment:
```powershell
python -m venv venv
```

3. Activate virtual environment:
```powershell
.\venv\Scripts\Activate.ps1
```

If you get an execution policy error, run:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

4. Install dependencies:
```powershell
pip install -r requirements.txt
```

5. Run the server:
```powershell
python main.py
```

## Option 2: WSL/Linux

1. Navigate to backend directory:
```bash
cd backend
```

2. Create virtual environment:
```bash
python3 -m venv venv
```

3. Activate virtual environment:
```bash
source venv/bin/activate
```

4. Install dependencies:
```bash
pip install -r requirements.txt
```

5. Run the server:
```bash
python main.py
```

## Troubleshooting

### Issue: `TypeError: Client.__init__() got an unexpected keyword argument 'proxies'`
**Solution**: Updated `requirements.txt` with compatible versions of `openai` and `httpx`

### Issue: PowerShell execution policy
**Solution**: Run `Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser`

### Issue: Python command not found
**Solution**: Use `python3` instead of `python` on Linux/WSL
