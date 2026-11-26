function getUniversity(){
    const input  = document.getElementById('countryInput')
    const country = input.value.trim();

    const statusMessage = document.getElementById('statusMessage')
    const table = document.getElementById('universityTable')
    const tbody = document.getElementById('universityList')

    tbody.innerHTML = ''
    table.style.display = 'none'

    const apiUrl = `http://universities.hipolabs.com/search?country=${encodeURIComponent(country)}`

    fetch(apiUrl).then(function(response){
        if(!response.ok){
            throw new Error('Error occured with response.')
        }return response.json()
    }).then(function(data){
        if(data.length === 0){
            statusMessage.style.color = 'red';
            statusMessage.innerHTML = `found ${data.length} universities in ${country}`
            return
        }
        statusMessage.style.color = 'green';
        statusMessage.innerHTML = `found ${data.length} universities in ${country}`

        data.forEach(function(uni,index){
            const tr = document.createElement('tr')

            const state = uni['state-province']? uni['state-province'] : 'N/A'

            const website = (uni.web_pages && uni.web_pages.length > 0) ? `<a href="${uni.web_pages[0]}" target="_blank">${uni.web_pages[0]}</a> `: 'N/A'

            tr.innerHTML = `
             <td>${index + 1}</td>
                    <td><strong>${uni.name}</strong></td>
                    <td><span class="state-badge">${state}</span></td>
                    <td>
                        ${website}
                    </td>`
                    tbody.appendChild(tr)

                    table.style.display = 'table'

        })
    })
    .catch(function(error){
        console.error('Error fetching data:', error)
        statusMessage.style.color = 'red'
        statusMessage.innerHTML = 'An error occurred while fetching data. Please try again later.'
    })
}

