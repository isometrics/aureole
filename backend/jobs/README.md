# Minimal Celery Example

## Run Redis (required)
```bash
redis-server
```

## Start Celery Worker
```bash
cd celery_tests
celery -A celery_app worker --loglevel=info
```

## Run Tasks (in another terminal)
```bash
cd celery_tests
python run_tasks.py
``` 