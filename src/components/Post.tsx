import React, { useState, useEffect } from "react";
import styles from "./Post.module.css";
import { db } from "../firebase";
import firebase from "firebase/app";
import { useSelector } from "react-redux";
import { selectUser } from "../features/userSlice";
import { Avatar } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import MessageIcon from "@material-ui/icons/Message";
import SendIcon from "@material-ui/icons/Send";

// PROPSオブジェクトの型の定義
interface PROPS {
  postId: string;
  avatar: string;
  image: string;
  text: string;
    // タイムスタンプのみany型
  timestamp: any;
  username: string;
}

// コメント定義
interface COMMENT {
  id: string;
  avatar: string;
  text: string;
  timestamp: any;
  username: string;
}

// コメントに表示されるスモールアバター画像
const useStyles = makeStyles((theme) => ({
  small: {
    width: theme.spacing(3),
    height: theme.spacing(3),
    marginRight: theme.spacing(1),
  },
}));

// propsでこれらの値を受け取る
const Post: React.FC<PROPS> = (props) => {
  const classes = useStyles();
  const user = useSelector(selectUser);
  const [openComments, setOpenComments] = useState(false);
    // コメントの定義 ユーザーが書き込んだコメントをstateで保持
  const [comment, setComment] = useState("");
    // firebaseから取得したコメントを配列で保持するためのstate
  const [comments, setComments] = useState<COMMENT[]>([
    {
      id: "",
      avatar: "",
      text: "",
      username: "",
      timestamp: null,
    },
  ]);

  useEffect(() => {
    const unSub = db
      .collection("posts")
      .doc(props.postId)
      .collection("comments")
      .orderBy("timestamp", "desc")
      .onSnapshot((snapshot) => {
        setComments(
          snapshot.docs.map((doc) => ({
            id: doc.id,
            avatar: doc.data().avatar,
            text: doc.data().text,
            username: doc.data().username,
            timestamp: doc.data().timestamp,
          }))
        );
      });

    return () => {
      unSub();
    };
  }, [props.postId]);

    // コメントがタイピングされると、stateが更新される関数
  const newComment = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
        // firebase データベースにコメントを新規で登録
    db.collection("posts").doc(props.postId).collection("comments").add({
      avatar: user.photoUrl,
      text: comment,
      timestamp: firebase.firestore.FieldValue.serverTimestamp(),
      username: user.displayName,
    });
    setComment("");
  };
  return (
    <div className={styles.post}>
      {/* アバター画像 */}
      <div className={styles.post_avatar}>
        <Avatar src={props.avatar} />
      </div>
      <div className={styles.post_body}>
        <div>
          <div className={styles.post_header}>
              {/* ユーザーネーム,タイムスタンプ */}
            <h3>
              <span className={styles.post_headerUser}>@{props.username}</span>
              <span className={styles.post_headerTime}>
                {new Date(props.timestamp?.toDate()).toLocaleString()}
              </span>
            </h3>
          </div>
          {/* 投稿内容 */}
          <div className={styles.post_tweet}>
            <p>{props.text}</p>
          </div>
        </div>
        {props.image && (
          <div className={styles.post_tweetImage}>
            <img src={props.image} alt="tweet" />
          </div>
        )}

        {/* コメントのトグル */}
        <MessageIcon
          className={styles.post_commentIcon}
          onClick={() => setOpenComments(!openComments)}
        />

        {openComments && (
          // firebaseから取得したコメントを展開
          <>
            {comments.map((com) => (
              <div key={com.id} className={styles.post_comment}>
                {/* アバター画像 */}
                <Avatar src={com.avatar} className={classes.small} />
                {/* ユーザー名 */}
                <span className={styles.post_commentUser}>@{com.username}</span>
                {/* コメント内容 */}
                <span className={styles.post_commentText}>{com.text} </span>
                {/* 時間 */}                
                <span className={styles.post_headerTime}>
                  {new Date(com.timestamp?.toDate()).toLocaleString()}
                </span>
              </div>
            ))}

          {/* コメントの追加関数のフォーム */}
            <form onSubmit={newComment}>
              <div className={styles.post_form}>
                <input
                  className={styles.post_input}
                  type="text"
                  placeholder="Type new comment..."
                  value={comment}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setComment(e.target.value)
                  }
                />
                <button
                  disabled={!comment}
                  className={
                    comment ? styles.post_button : styles.post_buttonDisable
                  }
                  type="submit"
                >
                  <SendIcon className={styles.post_sendIcon} />
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default Post;