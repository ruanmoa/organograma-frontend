const url = 'http://localhost:3000/employee'
var chart

async function getContent(){
    try {
        const response = await fetch(url)
        const data = await response.json()
        return data

    } catch (error) {
        console.error(error)
    }
}

getContent().then((employees) => {
    console.log(employees)
})

d3.csv(
'https://raw.githubusercontent.com/bumbeishvili/sample-data/main/org.csv'
).then((dataFlattened) => {
chart = new d3.OrgChart()
    .container('.chart-container')
    .data(dataFlattened)
    .nodeHeight((d) => 85)
    .nodeWidth((d) => 220)
    .childrenMargin((d) => 50)
    .compactMarginBetween((d) => 25)
    .compactMarginPair((d) => 50)
    .neightbourMargin((a, b) => 25)
    .siblingsMargin((d) => 25)
    .buttonContent(({ node, state }) => {
    return `<div class="button"> <span class="span-button">${
        node.children
        ? `<i class="fas fa-angle-up"></i>`
        : `<i class="fas fa-angle-down"></i>`
    }</span> ${node.data._directSubordinates}  </div>`;
    })
    .nodeContent(function (d, i, arr, state) {
    const color = '#FFFFFF';
    return `
    <div class="content">
        <div class="avatar-ring" ></div>
        <img src=" ${d.data.imageUrl}" class="avatar" />
        <div class="detail"><i class="fas fa-ellipsis-h"></i></div>
        <div class="name"> ${d.data.name} </div>
        <div class="positionName"> ${d.data.positionName} </div>
    </div>
`;
    })
    .render();
});

function show(employees) {
    let output = ''

    for( let employee of employees) {
        output += `<li>${employee.name}</li>`
    }

    document.querySelector('main').innerHTML = output
}