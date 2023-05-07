import React from 'react'
import styles from './Fees.module.css'
import {auth} from '../firebase'
import TweetInput from './TweetInput'

const Feed = () => {
  return (
    <div className={styles.feed}>
      <TweetInput/>
      <button onClick={()=>auth.signOut()}>Logout</button>
    </div>
  )
}

export default Feed