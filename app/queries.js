
export function userQuery  (userid)  { 
    return `
      {
        user (where:{id: {_eq: ${userid}}}) {
          login
          id
        }
   }
 `   
 }

export function XpQuery  (username, offset)  { 
    return `
    {
      user (where:{id: {_eq: ${username}}}) {
        transactions(where: {type: {_eq: "xp"}}, limit:100, offset: ${offset}) {
          amount
          type
          user {
            login
          }
          path
          object{
            name
            type
          }
        }
      }
    }
  `   
  }

  export function AuditsQuery  (type ,username, offset)  { 
    return `
    {
      user (where:{id: {_eq: ${username}}}) {
        transactions(where: {type: {_eq: ${type}}}, limit:100, offset: ${offset}) {
          amount
          type
          path
        }
      }
    }
  `   
  }


  export function levelQuery  (username)  { 
    return `
    {
      user (where:{id: {_eq: ${username}}}) {
        transactions(where: {type: {_eq: "level"}}, limit:1, offset: 0, order_by: {amount: desc}) {
          amount
          type
          path
        }
      }
    }
  `   
  }


export function userProgressesQuery  (username, offset)  {
    return `
    {
      user(where: { id: { _eq: ${username} } }) {
        progresses (
          where: {
            isDone: { _eq: true },
            _and: [
              { path: { _like: "/johvi/div-01/%" } },
              {
                _and: [
                  { path: { _nlike: "/johvi/div-01/piscine-js-2-old/%" } },
                  { path: { _nlike: "/johvi/div-01/rust/%" } },
                  { path: { _nlike: "/johvi/piscine-go/%" } }
                ]
              }
            ]
          },
          limit: 100,
          offset: ${offset}
        ) {
          user {
            login
          }
          path
          isDone
        }
      }
    }
    `
  }