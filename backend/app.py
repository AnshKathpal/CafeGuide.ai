import os
import sys
from flask import Flask, request, jsonify
from dotenv import load_dotenv, find_dotenv
import openai
from langchain.document_loaders import PyPDFLoader
from langchain.embeddings.openai import OpenAIEmbeddings
from langchain.vectorstores import Chroma
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.chat_models import ChatOpenAI
from langchain.chains import RetrievalQA
from langchain.chains import ConversationalRetrievalChain
from langchain.memory import ConversationBufferMemory
import subprocess
from flask_cors import CORS



_ = load_dotenv(find_dotenv())


openai.api_key = os.environ["OPENAI_API_KEY"]

app = Flask(__name__)
CORS(app)

subprocess.run(["rm", "-rf", "./docs/chroma"])


loader = PyPDFLoader("./docs/cafes.pdf")
pages = loader.load()


text_splitter = RecursiveCharacterTextSplitter(
    chunk_size=50,
    chunk_overlap=20
)
splits = text_splitter.split_documents(pages)


embedding = OpenAIEmbeddings()
persist_directory = "docs/chroma/"


vectordb = Chroma.from_documents(
    documents=splits,
    embedding=embedding,
    persist_directory=persist_directory
)


llm = ChatOpenAI(model_name="gpt-3.5-turbo", temperature=1)


qa_chain = RetrievalQA.from_chain_type(
    llm,
    retriever=vectordb.as_retriever()
)


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

@app.route("/chat", methods=["POST"])
def chat():
    try:
        # Parse incoming JSON data
        data = request.json
        question = data.get("question")

        # Perform the question-answering process
        result = qa({"question": question})
        answer_from_chat = result["answer"]

        # Perform similarity search
        docs = vectordb.similarity_search(question, k=3)

        print(docs)



        # Extract page content from the top 3 results
        page_contents = [doc.page_content for doc in docs]
        page_number = [doc.metadata for doc in docs]

        # Combine the responses
        response_data = {
            "answer_from_chat": answer_from_chat,
            "top_3_similarity_results": page_contents,
            "meta_data" : page_number
        }
        return jsonify(response_data)

    except Exception as e:
        error_message = str(e)
        return jsonify({"error": error_message}), 500

if __name__ == "__main__":
    app.run(debug=True)
