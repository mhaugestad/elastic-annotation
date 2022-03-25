import pandas as pd
from pydantic.main import ModelMetaclass
from pydantic import BaseModel, Field
from typing import List

def validate_data_schema(data_schema: ModelMetaclass):
    """This decorator will validate a pandas.DataFrame against the given data_schema."""

    def Inner(func):
        def wrapper(*args, **kwargs):
            res = func(*args, **kwargs)
            if isinstance(res, pd.DataFrame):
                # check result of the function execution against the data_schema
                df_dict = res.to_dict(orient="records")
                
                # Wrap the data_schema into a helper class for validation
                class ValidationWrap(BaseModel):
                    df_dict: List[data_schema]
                # Do the validation
                _ = ValidationWrap(df_dict=df_dict)
            else:
                raise TypeError("Your Function is not returning an object of type pandas.DataFrame.")

            # return the function result
            return res
        return wrapper
    return Inner

class MeltwaterData(BaseModel):
    Date: str
    Headline: str
    URL: str
    OpeningText: str
    HitSentence: str
    Source: str
    Influencer: str
    Country: str
    Subregion: str
    Language: str
    Reach: str
    DesktopReach: str
    MobileReach: str
    TwitterSocialEcho: str
    FacebookSocialEcho: str
    RedditSocialEcho: str
    NationalViewership: str
    Engagement: str
    AVE: str
    Sentiment: str
    KeyPhrases: str
    InputName: str
    Keywords: str
    TwitterAuthority: str
    TweetId: str
    TwitterId: str
    TwitterClient: str
    TwitterScreenName: str
    UserProfileUrl: str
    TwitterBio: str
    TwitterFollowers: str
    TwitterFollowing: str
    AlternateDateFormat: str
    Time: str
    State: str
    City: str
    DocumentTags: str

@validate_data_schema(data_schema=MeltwaterData)
def validate_meltwater_data(df) -> pd.DataFrame:
    return df