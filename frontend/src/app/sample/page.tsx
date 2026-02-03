'use client'
import React, { useState } from 'react'

type Props = {}

const page = (props: Props) => {
    const data = ["Apple" ,"Mango" ,"Graps"] ; 
    const [search ,setsearch] = useState("") ; 

    const [category ,setCategory] = useState("all") ; 

    const [show ,setShow] = useState(false) ; 

    const filterdata = data.filter(item => 
        item.toLowerCase().includes(search.toLowerCase()) 
    )

    const cdata = [
        {
            title : "abiral" ,
            category : "male"
        },
        {
            title : "akshay" ,
            category : "male"
        },
        {
            title : "lavdhi" ,
            category : "female"
        },
        {
            title : "aditiya" ,
            category : "thirdgender"
        }
    ]

    const filtered = cdata.filter(item => 
        category === "all" ? true : item.category === category
    )



  return (
    <div>
        <input 
        value={search} 
        onChange={(e) => setsearch(e.target.value)}
        placeholder='search'
        />
        {
            search ? (
                filterdata.map((item) => {
                    return <div>
                        {item}
                        <br />
                    </div>
                }
                )
            )  : (
                data.map((item) => {
                    return <div>
                        {item}
                        <br />
                        </div>
                })
            )
        }

        <br />
        <br />
        <br />

        <select 
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        >
                <option value="all">all</option>
                <option value="male">male</option>
                <option value="female">female</option>
                <option value="thirdgender">thirdgender</option>
        </select>

        <ul>
            {
                filtered.map((item) => {
                    return <li>
                        {item.title} <span>-</span> {item.category}
                    </li>
                })
            }
        </ul>

        <br />
        <br />
        <br />

        <button onClick={() => setShow(prev => !prev)}>
            {show ? "hide" : "show"} description
        </button>

        {
            show && <p>this is description</p>
        }

    </div>
  )
}

export default page