const urljson = 'http://localhost:3000/employee'
const urlImg = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAHgAAAB4CAYAAAA5ZDbSAAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH4QMaAyMA1SdmlAAAAVRJREFUeNrt26FOw2AUhuFTElzrETNLMNPtJVRVVFbtlnYXKGQFqldANo3EoLDUITazzCxBTNBk53lv4M+XJ/ndKZ52L9uft9eP+Oeqbtgs8O7+cbWO36/PiIgmwd4ojsdIU9n2l7XzNBYZNj9Eos6oTRbcdMAZAwxYgAVYgAVYgAUYsAALsAALsAALMGABFmABFmABFmABBizAAqwFgZ/fv+slHl7q3aobNpn2proujIgo276ep/HgixZgARZgARZgAQYswAIswAIswAIswIAFWIAFWIAFWIABC7AAC7AAC7D+AHZdeN97XRf6ogVYgAVYgAVYgAELsAALsAALsAADFmABFmABFmABFmDAAizAAizAAqxrYNeF973XdaEvWoAFWIAFWIAFGLAAC7AAC7AACzBgARZgARZgARZgAQYswAIswAKsW0p1m1S2/WXtPI1Fhs0nxU1Jj2yxm2sAAAAASUVORK5CYII=`;
var chart
var selectedId
var alertPlaceholder = document.getElementById('liveAlertPlaceholder')
var confirmRemovalPlaceholder = document.getElementById('confirmRemovalPlaceholder')
var modalWrap = null

d3.json(urljson).then((dataFlattened) => {
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
        .onNodeClick((d) => {
            selectNode(d)
        })
        .render();
    
    const replaced = urlImg.replace(/(\r\n|\n|\r)/gm);
    d3.select('.svg-chart-container')
        .style(
            'background-image',
            `url(${replaced}), radial-gradient(circle at center, #04192B 0, #000B0E 100%)`
        );
});

selectNode = (nodeId) => {
    console.log(nodeId)
    chart.clearHighlighting()
    chart.setHighlighted(nodeId).render()
    selectedId = nodeId
}

removeSelectedNode = () => {
    if(selectedId === undefined) {
        alert('Selecione o colaborador que será removido', 'warning')
        return
    }

    showConfirmRemovalModal(() => {
        try {
            fetch(urljson +'/'+ selectedId, {
                method: 'DELETE',
            })
            .then(res => {
                chart.removeNode(selectedId)
                selectedId = undefined
                alert( 'Colaborador removido com sucesso', 'success')
            })
            .catch((error) => {
                console.log(error)
            });
        } catch (error) {
            alert(`Não foi possível remover o colaborador selecionado. Mensagem de erro: ${error.message}`, 'danger')
        }
    })
}

addNode = () => {
    if(selectedId === undefined) {
        alert('Selecione o colaborador responsável', 'warning')
        return
    }

    showAddEmployeeForm(() => {
        try {
            const employee = {
                "name": "teste10",
                "imageUrl": "https://cdn3.vectorstock.com/i/1000x1000/13/47/person-gray-photo-placeholder-woman-vector-23511347.jpg",
                "office": "EPDI",
                "tags": "teste",
                "positionName": "estágio",
                "hiringDate": "2020-04-02T00:00:00.000Z",
                "employeeCode": "O-0100",
                "parentId": selectedId
            }

            //const formData = new FormData()
            //formData.append("json", JSON.stringify( employee ))
            fetch(urljson, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify( employee )
            }).then(response => {
                if(response.status === 200) {
                    response.json().then(responseJson => {
                        chart.addNode(responseJson)
                        alert('Colaborador adicionado com sucesso', 'success')
                    })
                } else if ( response.status === 400) {
                    response.text().then(responseText => {
                        alert(`Não foi possível adicionar o colaborador. Mensagem de erro: ${responseText}`, 'danger')
                    })
                } else {
                    alert(`Não foi possível adicionar o colaborador. Mensagem de erro: ${response.statusText}`, 'danger')
                }
            })
        } catch (error) {
            alert(`Não foi possível adicionar o colaborador. Mensagem de erro: ${error.message}`, 'danger')
        }
    })
}

function alert(message, type) {

    const oldDiv = document.getElementById('alertDiv')
    if(oldDiv)
        alertPlaceholder.removeChild(oldDiv)

    var wrapper = document.createElement('div')
    wrapper.id = 'alertDiv'
    wrapper.innerHTML = `
        <div class="alert alert-${type} alert-dismissible fade show" role="alert"> ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close">
            </button>
        </div>
    `
    alertPlaceholder.append(wrapper)
}

const showConfirmRemovalModal = (callback) => {
    if(modalWrap !== null){
        modalWrap.remove()
    }

    modalWrap = document.createElement('div')
    modalWrap.innerHTML = `
        <div class="modal fade" 
                id="exampleModal" 
                tabindex="-1" 
                aria-labelledby="exampleModalLabel" 
                aria-hidden="true">
            <div class="modal-dialog">
                <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" 
                            id="exampleModalLabel">
                        Remover colaborador
                    </h5>
                    <button type="button" 
                            class="btn-close" 
                            data-bs-dismiss="modal" 
                            aria-label="Close">
                    </button>
                </div>
                <div class="modal-body">
                    Tem certeza que deseja remover o colaborador selecionado?
                </div>
                <div class="modal-footer">
                    <button type="button" 
                            class="btn btn-secondary" 
                            data-bs-dismiss="modal">
                        Cancelar
                    </button>
                    <button type="button" 
                            class="btn btn-primary 
                            modal-success-btn" 
                            data-bs-dismiss="modal">
                        SIM
                    </button>
                </div>
                </div>
            </div>
        </div>
    `
    modalWrap.querySelector('.modal-success-btn').onclick = callback

    document.body.append(modalWrap)
    
    var modal = new bootstrap.Modal(modalWrap.querySelector('.modal'))
    modal.show()
}

const showAddEmployeeForm = (callback) => {
    
    if(modalWrap !== null){
        modalWrap.remove()
    }

    modalWrap = document.createElement('div')
    modalWrap.innerHTML = `
        <div class="modal fade" 
                id="exampleModal" 
                tabindex="-1" 
                aria-labelledby="exampleModalLabel" 
                aria-hidden="true">
            <div class="modal-dialog">
                <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" 
                            id="exampleModalLabel">
                        Adicionar colaborador
                    </h5>
                    <button type="button" 
                            class="btn-close" 
                            data-bs-dismiss="modal" 
                            aria-label="Close">
                    </button>
                </div>
                <form class="modal-body row g-3">
                    <div class="col-md-6">
                        <label for="inputName" class="form-label">Nome</label>
                        <input type="text" class="form-control" id="inputName">
                    </div>
                    <div class="col-md-6">
                        <label for="inputHiringDate" class="form-label">Data de contratação</label>
                        <input type="date" class="form-control" id="inputHiringDate">
                    </div>
                    <div class="col-md-12">
                        <label for="inputImageURL" class="form-label">URL da Foto</label>
                        <input type="url" class="form-control" id="inputImageURL">
                    </div>
                    <div class="col-6">
                        <label for="inputOffice" class="form-label">Departamento</label>
                        <input type="text" class="form-control" id="inputOffice" placeholder="EPDI">
                    </div>
                    <div class="col-6">
                        <label for="inputPositionName" class="form-label">Cargo que ocupa</label>
                        <input type="text" class="form-control" id="inputPositionName" placeholder="Analista de P&D">
                    </div>
                   
                    <div class="col-md-6">
                        <label for="inputCode" class="form-label">ID de Registro</label>
                        <input type="text" class="form-control" id="inputCode">
                    </div>
                    <div class="col-md-6">
                        <label for="inputParentId" class="form-label">Nome do Líder</label>
                        <input type="text" class="form-control" id="inputParentId">
                    </div>
                    <div class="col-12">
                        <button type="submit"
                                class="btn btn-primary
                                modal-success-btn"
                                data-bs-dismiss="modal">
                            Salvar2
                        </button>
                        <button type="button" 
                                class="btn btn-secondary" 
                                data-bs-dismiss="modal">
                            Cancelar
                        </button>
                        <button type="button" 
                                class="btn btn-primary 
                                modal-success-btn" 
                                data-bs-dismiss="modal">
                            Salvar
                        </button>
                    </div>
                </form>
                <div class="modal-footer">
                    
                </div>
                </div>
            </div>
        </div>
    `

    modalWrap.querySelector('.modal-success-btn').onclick = callback

    document.body.append(modalWrap)
    
    var modal = new bootstrap.Modal(modalWrap.querySelector('.modal'))
    modal.show()
}