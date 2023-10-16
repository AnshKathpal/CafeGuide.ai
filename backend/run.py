from app import create_app

app = create_app()

# import json
# import requests
# import sseclient

# from dotenv import load_dotenv, find_dotenv
# import openai
# import os


# load_dotenv(find_dotenv())
# openai.api_key = os.environ["OPENAI_API_KEY"]


# def performStreaming():
#     requrl = "https://api.openai.com/v1/completions"
#     reqHeaders = {
#         "Accept" : "text/event-stream",
#         "Authorization" : "Bearer" + openai.api_key
#     }
#     reqBody = {
#         "model" : "text-davinci-003",
#         "prompt" : "What is Python",
#         "max_tokens" : 100,
#         "temperature" : 0,
#         "stream" : True
#     }

#     request = requests.post(requrl,stream = True, headers = reqHeaders,json = reqBody)
#     client = sseclient.SSEClient(request)
#     for event in client.events():
#         if event.data != '[DONE]':
#             print(json.loads(event.data)['choices'][0]['text'],end = "",flush = True)


# if __name__ == "__main__":
#     performStreaming()
