import requests

# URL модели
API_URL = "https://api-inference.huggingface.co/models/Qwen/Qwen2.5-Coder-32B-Instruct"

# Ваш токен Hugging Face
headers = {"Authorization": f"Bearer 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"}

# Функция запроса к API
def query(payload, parameters=None):
    request_body = {"inputs": payload}
    if parameters:
        request_body["parameters"] = parameters
    
    try:
        response = requests.post(API_URL, headers=headers, json=request_body)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        return {"error": str(e)}

# Пример использования
data = query(
    "Напиши функцию на Python для сортировки массива методом пузырька.",
    parameters={"max_new_tokens": 512, "temperature": 0.7}
)

# Обработка результата
if isinstance(data, list) and "generated_text" in data[0]:
    print(data[0]["generated_text"])
else:
    print("Ошибка или некорректный ответ:", data)



