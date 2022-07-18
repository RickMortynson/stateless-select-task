type Resp = {
  data: {
    id: number
    label: string
    slug: string
  }[]
}

enum urlSlugPrefix {
  terms = 's-',
  brands_terms = 'b-',
  styles = 'st-'
}

class FetchBase {
  state: Resp = { data: [] }
  private selectId: string = ''
  private Select: HTMLSelectElement | null = null

  private async loadData(search: string): Promise<Resp> {
    return await fetch('https://onboarding.art-code.team/api/test/v1/search/' + search).then(
      response => response.json() as Promise<Resp>
    )
  }

  private checkForRegex(withSlash: boolean) {
    const neededPrefix = urlSlugPrefix[this.selectId as keyof typeof urlSlugPrefix]

    const slash = withSlash ? '/' : ''
    const regex = new RegExp(`${slash}${neededPrefix}`, 'gm')

    return { neededPrefix, regex }
  }

  private loadSelect() {
    let content = ''
    const { regex, neededPrefix } = this.checkForRegex(false)

    const paths = window.location.pathname.split('/')
    let thisSelectIdInPath: string = ''
    paths.forEach(path => {
      if (regex.test(path)) {
        thisSelectIdInPath = path.replace(neededPrefix, '')
      }
    })

    this.state.data.forEach(element => {
      content += `
        <option
          ${element.slug === thisSelectIdInPath && 'selected'}
          value="${element.slug}"
        >
          ${element.label}
        </option>
      `
    })

    this.Select!.innerHTML = content
  }

  private addEvent() {
    // TBH i don't know how to type 'e' to extend event.target.value
    this.Select!.addEventListener('change', (event: any) => {
      let pathName = window.location.pathname
      const { regex, neededPrefix } = this.checkForRegex(true)

      if (!regex.test(pathName)) {
        pathName += neededPrefix + event.target.value + '/'

        history.pushState({}, '', pathName)
        return
      }

      // HAPPENS ONLY if pathname does not contain value with needed prefix
      let paths = pathName.split('/')
      paths.forEach((path, index) => {
        if (path.startsWith(neededPrefix)) {
          paths[index] = neededPrefix + event.target.value
          console.log('PATHS:', paths.join('/'))
        }
      })

      history.pushState({}, '', paths.join('/'))
    })
  }

  constructor(url: string) {
    const select = document.getElementById(url) as HTMLSelectElement | null

    if (select === null) {
      console.error(`element with id ${url} is missing`)
      return
    }

    this.selectId = url
    this.Select = select

    return (async () => {
      this.state = await this.loadData(url)

      this.loadSelect()
      this.addEvent()

      return this
    })() as unknown as FetchBase
  }
}

new FetchBase('terms')
new FetchBase('brands_terms')
new FetchBase('styles')

export {}
