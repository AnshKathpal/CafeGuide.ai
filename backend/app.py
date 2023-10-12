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
openai.api_key = os.environ["OPENAI_API_KEY2"]

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


# def generate_text(prompt, max_tokens=50):
#     response = openai.Completion.create(
#         engine="text-davinci-003",  # Use GPT-3.5 Turbo engine
#         prompt=prompt,
#         max_tokens=max_tokens
#     )
#     return response.choices[0].text


@app.route("/chat", methods=["POST"])
def chat():
    try:
        data = request.json
        question = data.get("question")
        result = qa({"question": question})
        answer_from_chat = result["answer"]


        chatReply = format_links_as_html(answer_from_chat)


        docs = vectordb.similarity_search(question, k=10)
        print(docs)
        response_data = {
            "answer_from_chat": chatReply
        }
        return jsonify(response_data)
    except Exception as e:
        error_message = str(e)
        return jsonify({"error": error_message}), 500
    
def format_links_as_html(text):
    # This function formats links as HTML anchor tags
    words = text.split()
    formatted_text = []
    for word in words:
        if word.startswith("http://") or word.startswith("https://"):
            # If it's a link, format it as an HTML anchor tag
            formatted_text.append(f'<a href="{word}" target="_blank">{word}</a>')
        else:
            formatted_text.append(word)
    return " ".join(formatted_text)


if __name__ == "__main__":
    app.run(debug=True)
