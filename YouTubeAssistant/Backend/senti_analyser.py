from nltk.sentiment.vader import SentimentIntensityAnalyzer
import pandas as pd
def sentiment_analysis(comments=[]):
    sia = SentimentIntensityAnalyzer()
    nLikes = 0
    nComp = 0
    for x in range(0, len(comments)):
        d = sia.polarity_scores(comments[x]["text"])
        nComp+=d["compound"]*(comments[x]["likes"]+1)
        nLikes+=comments[x]["likes"]+1
        #print("Likes",comments[x]["likes"])
  
    nCumm = (nComp)/nLikes
   
    d = {
        "Cumulative":nCumm
    }
    print("D: ",d)
    return d