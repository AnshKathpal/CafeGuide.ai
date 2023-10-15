import os
from flask import Flask, request, jsonify
from dotenv import load_dotenv, find_dotenv
import openai
from langchain.vectorstores import Chroma
from langchain.embeddings.openai import OpenAIEmbeddings
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.chains import RetrievalQA
from langchain.document_loaders import TextLoader
from langchain.document_loaders import JSONLoader
from langchain.llms import OpenAI
from flask_cors import CORS
from langchain.chat_models import ChatOpenAI
from langchain.chains import ConversationalRetrievalChain
from langchain.memory import ConversationBufferMemory
import subprocess
import json



app = Flask(__name__)
CORS(app)

subprocess.run(["rm", "-rf", "./docs/chroma"])

load_dotenv(find_dotenv())
openai.api_key = os.environ["OPENAI_API_KEY"]


loader = JSONLoader(
    file_path="db.json",
    text_content=False,
    jq_schema=".[]"
)

data = loader.load()


textSplitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=0)
texts = textSplitter.split_documents(data)


paragraphs = []
for document in texts:
    page_content = document.page_content
    paragraphs.append(page_content)

# for paragraph in paragraphs:
#     print(paragraph)

embeddings = OpenAIEmbeddings(openai_api_key=openai.api_key)

# print(texts)

persist_directory = "docs/chroma/"

vectordb = Chroma.from_documents(
    documents=texts,
    embedding=embeddings,
    persist_directory=persist_directory
)

# llm = OpenAI(openai_api_key=openai.api_key)
llm = ChatOpenAI(model_name="gpt-3.5-turbo", temperature=1)

qa_chain = RetrievalQA.from_chain_type(
    llm=llm, chain_type="stuff", retriever=vectordb.as_retriever())
# print(qa.run("Google map location of Hauz Khas Social"))

memory = ConversationBufferMemory(
    memory_key="chat_history",
    return_messages=True
)

retriever = vectordb.as_retriever()


qa = ConversationalRetrievalChain.from_llm(
    llm,
    retriever=retriever,
    memory=memory
)


product_function = [
    {
        "name": "get_product_id",
        "description": "Get all the id of the product from given text",
        "parameters": {
            "type": "object",
            "properties": {
                "data": {
                    "type": "array",
                    "items": {
                        "type": "object",
                        "properties": {
                            "id": {
                                "type": "number",
                                "description": "Product ID, e.g. 1"
                            },
                            "name": {
                                "type": "string",
                                "description": "Cafe Name, e.g. Diggin"
                            },
                            "image": {
                                "type": "string",
                                "description": "Cafe Image, e.g. https://im1.dineout.co.in/images/uploads/restaurant/sharpen/1/i/t/p15105-145690007356d687e9547a8.jpg?tr=tr:n-xlarge"
                            },
                            "recommendation": {
                                "type": "object",
                                "properties": {
                                    "name": {
                                        "type": "string",
                                        "description": "Recommendation Name, e.g. Diggin"
                                    },
                                    "address": {
                                        "type": "string",
                                        "description": "Recommendation Address, e.g. 11, Santushti Shopping Complex, Race Course Road, Chanakyapuri, New Delhi, Delhi 110021, India"
                                    },
                                    "rating": {
                                        "type": "string",
                                        "description": "Recommendation Rating e.g. 4.5 to 5 stars"
                                    },
                                    "image": {
                                        "type": "string",
                                        "description": "Recommendation Image e.g. https://im1.dineout.co.in/images/uploads/restaurant/sharpen/1/i/t/p15105-145690007356d687e9547a8.jpg?tr=tr:n-xlarge"
                                    },
                                    "location": {
                                        "type": "string",
                                        "description": "Recommendation Location e.g. https://maps.app.goo.gl/nkcnz3f4yCTqEvVu6"
                                    },
                                    "booking": {
                                        "type": "string",
                                        "description": "Recommendation Booking e.g. https://www.dineout.co.in/delhi/cafe-delhi-heights-rk-puram-south-delhi-20189"
                                    }
                                },
                                "required": ["name", "address", "rating", "image", "location", "booking"]
                            }
                        },
                        "required": ["id", "name", "image"]
                    }
                }
            },
            "required": ["data"]
        }
    }
]


@app.route("/chat", methods=["POST"])
def chat():
    try:

       
    
        data = request.json
        question = data.get("question")
        result = qa({"question": question})
        answer_from_chat = result["answer"]


        chatReply = format_links_as_html(answer_from_chat)


        docs = vectordb.similarity_search(question, k=10)
        # print(docs)

        completion = openai.ChatCompletion.create(
            model="gpt-3.5-turbo-0613",
            messages=[{"role": "user", "content": f"""{docs}"""}],
            functions=product_function,
            function_call="auto"
        )

        output = completion.choices[0].message
        # print(output, "output")

        arguments = json.loads(output.function_call.arguments)

        print(arguments, "args")

        ids = [item['id'] for item in arguments['data']]
        print(ids)
        names = [item["name"] for item in arguments["data"]]
        print(names)
        images = [item["image"] for item in arguments["data"]]
        print(images)
        recommendations = [item["recommendation"]
                           for item in arguments["data"]]
        print(recommendations)

        response_data = {
            "answer_from_chat": chatReply,
            "args": ids,
            "name": names,
            "recommended": recommendations
        }

        if "images" in question.lower():
            response_data["image"] = images

        return jsonify(response_data)
    
    except Exception as e:
        error_message = e
        return jsonify({"error": error_message}), 500


@app.route("/")
def home():
    return "Home page"
      


def format_links_as_html(text):
    # This function formats links as HTML anchor tags
    words = text.split()
    formatted_text = []
    for word in words:
        if word.startswith("http://") or word.startswith("https://"):
            # If it's a link, format it as an HTML anchor tag
            formatted_text.append(
                f'<a href="{word}" target="_blank">{word}</a>')
        else:
            formatted_text.append(word)
    return " ".join(formatted_text)

if __name__ == "__main__":
    app.run(debug=True)